import { ServiceGet, Rate, rate, RateGetParams, Transaction, ServiceSearch, Serializable } from "types";
import { ExchangeTxsSearchRequest } from "services/transactions/exchange";
import { BigNumber } from "@waves/bignumber";
import { Task, waitAll, of } from "folktale/concurrency/task";
import { AppError } from "errorHandling";
import { SortOrder } from "services/_common";
import * as maybe from 'folktale/maybe';
import { RateSerivceCreatorDependencies } from '../../services'
import { tap } from "utils/tap";
import * as LRU from 'lru-cache';

const WavesId: string = 'WAVES';

enum RateOrder {
  Straight, Inverted
}

type RateRequest = [string, string, RateOrder];

function map<T, R>(data: T[], fn: (val: T) => R): R[] {
  return data.reduce((acc: R[], x: T) => {
    acc.push(fn(x));
    return acc;
  }, []);
}

export interface PairCheckService {
  checkPair(matcher: string, pair: [string, string]): Task<AppError, maybe.Maybe<[string, string]>>
}

const max = (data: BigNumber[]): maybe.Maybe<BigNumber> =>
  data.length === 0 ? maybe.empty() : maybe.of(BigNumber.max(...data));

export class RateEstimator implements ServiceGet<RateGetParams, Rate> {
  constructor(
    private readonly transactionService: ServiceSearch<ExchangeTxsSearchRequest, Transaction>,    
    private readonly pairChecker: PairCheckService
  ) {}

  get(request: RateGetParams): Task<AppError, maybe.Maybe<Rate>> {
    return this.getRate(request.amountAsset, request.priceAsset, request.matcher)
      .map(rateValue => maybe.of(rate(rateValue)))
  }

  private countRateFromTransactions([amountAsset, priceAsset, order]: RateRequest, matcher: string): Task<AppError, BigNumber> {
    return this.transactionService.search(
      {
        amountAsset,
        priceAsset,
        limit: 5,
        matcher,
        sender: matcher,
        timeStart: new Date(0),
        timeEnd: new Date(),
        sort: SortOrder.Descending,
      }
    ).map(
      // TODO: fix any
      transactions => transactions.length === 0 ? new BigNumber(0) : BigNumber.sum(
          ...transactions.map((x: any) => new BigNumber(x.data.price))
      ).div(transactions.length)
    ).map(
      res => order === RateOrder.Straight ? res : new BigNumber(1).div(res)
    )
  }
  
  private getActualRate(from: string, to: string, matcher: string): Task<AppError, BigNumber> {
    const requests: Task<AppError, RateRequest[]> = this.pairChecker.checkPair(matcher, [from, to]).map(
      (res: maybe.Maybe<[string, string]>) =>
        {
          return res.map(
            ([actualFrom, actualTo]: [string, string]): RateRequest[] =>
              [[actualFrom, actualTo, from === actualFrom ? RateOrder.Straight : RateOrder.Inverted]]
          )
            .getOrElse([[from, to, RateOrder.Straight] as RateRequest, [to, from, RateOrder.Inverted] as RateRequest]);
        }
    );

    const results = requests.map(
      data => map(data, request => this.countRateFromTransactions(request, matcher))
    )

    return results.chain(
      results => waitAll(results).map((data: BigNumber[]) => max(data).getOrElse(new BigNumber(0)))
    )
  }

  private getRate(amountAsset: string, priceAsset: string, matcher: string): Task<AppError, BigNumber> {
    if (amountAsset === priceAsset) {
      return of(new BigNumber(1));
    } if (amountAsset === WavesId || priceAsset === WavesId) {
      return this.getActualRate(amountAsset, priceAsset, matcher);
    } else {
      return waitAll(
        [
          this.getActualRate(amountAsset, WavesId, matcher),
          this.getActualRate(priceAsset, WavesId, matcher)
        ]
      ).map(([rate1, rate2]) => rate2.eq(0) ? new BigNumber(0) : rate1.div(rate2));
    }
  }
}

const toCacheKey = (params: RateGetParams): string =>
  [params.matcher, params.amountAsset, params.priceAsset].join("::");

const CACHE_AGE_MILLIS = 5000;
const CACHE_SIZE = 100000;

export default function({
  txService,
  pairCheckService
}: RateSerivceCreatorDependencies): ServiceGet<RateGetParams, Rate> {

  const cache = new LRU<string, maybe.Maybe<Rate>>(
    {
      max: CACHE_SIZE,
      maxAge: CACHE_AGE_MILLIS,
    }
  );

  const estimator = new RateEstimator(txService, pairCheckService)
  
  return {
    get(request) {
      const key = toCacheKey(request);
      
      if (cache.has(key)) {
        return of(cache.get(key)!)
      }

      return estimator.get(request).map(
        tap(res => cache.set(key, res))
      )
    }
  }
}
