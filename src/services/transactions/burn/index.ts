import { propEq, compose } from 'ramda';

import { CommonServiceCreatorDependencies } from '../../../middleware/injectServices';
import {
  transaction,
  TransactionInfo,
  Transaction,
  ServiceGet,
  ServiceMget,
  ServiceSearch,
} from '../../../types';
import { WithLimit, WithSortOrder } from '../../_common';
import { RequestWithCursor } from '../../_common/pagination';
import { getByIdPreset } from '../../presets/pg/getById';
import { mgetByIdsPreset } from '../../presets/pg/mgetByIds';
import { searchWithPaginationPreset } from '../../presets/pg/searchWithPagination';
import { inputGet } from '../../presets/pg/getById/inputSchema';
import { inputMget } from '../../presets/pg/mgetByIds/inputSchema';

import { RawTx, CommonFilters } from '../_common/types';

import {
  result as resultSchema,
  inputSearch as inputSearchSchema,
} from './schema';
import * as sql from './sql';
import transformTxInfo from './transformTxInfo';

type BurnTxsSearchRequest = RequestWithCursor<
  CommonFilters & WithSortOrder & WithLimit,
  string
> & {
  assetId: string;
};

type BurnTxDbResponse = RawTx & {
  asset_id: string;
  amount: string;
};

export type BurnTxsService = ServiceGet<string, Transaction> &
  ServiceMget<string[], Transaction> &
  ServiceSearch<BurnTxsSearchRequest, Transaction>;

export default ({
  drivers: { pg },
  emitEvent,
}: CommonServiceCreatorDependencies): BurnTxsService => {
  return {
    get: getByIdPreset<string, BurnTxDbResponse, TransactionInfo, Transaction>({
      name: 'transactions.burn.get',
      sql: sql.get,
      inputSchema: inputGet,
      resultSchema,
      resultTypeFactory: transaction,
      transformResult: transformTxInfo,
    })({ pg, emitEvent }),

    mget: mgetByIdsPreset<
      string,
      BurnTxDbResponse,
      TransactionInfo,
      Transaction
    >({
      name: 'transactions.burn.mget',
      matchRequestResult: propEq('id'),
      sql: sql.mget,
      inputSchema: inputMget,
      resultTypeFactory: transaction,
      resultSchema,
      transformResult: transformTxInfo,
    })({ pg, emitEvent }),

    search: searchWithPaginationPreset<
      BurnTxsSearchRequest,
      BurnTxDbResponse,
      TransactionInfo,
      Transaction
    >({
      name: 'transactions.burn.search',
      sql: sql.search,
      inputSchema: inputSearchSchema,
      resultSchema,
      transformResult: compose(
        transaction,
        transformTxInfo
      ),
    })({ pg, emitEvent }),
  };
};
