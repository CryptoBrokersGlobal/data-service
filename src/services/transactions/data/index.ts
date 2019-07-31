import { identity, compose } from 'ramda';

import { CommonServiceCreatorDependencies } from '../..';
import {
  transaction,
  TransactionInfo,
  Transaction,
  List,
  ServiceGet,
  ServiceMget,
  ServiceSearch,
} from '../../../types';

import { WithLimit, WithSortOrder } from '../../_common';
import { get, mget, search } from '../../_common/createResolver';
import { RawTx, CommonFilters } from '../_common/types';

// validation
import { inputGet } from '../../presets/pg/getById/inputSchema';
import { inputMget } from '../../presets/pg/mgetByIds/inputSchema';
import { validateInput, validateResult } from '../../presets/validation';

// transformation
import { transformResults as transformResultGet } from '../../presets/pg/getById/transformResult';
import { transformResults as transformResultMget } from '../../presets/pg/mgetByIds/transformResult';
import { transformInput as transformInputSearch } from '../../presets/pg/searchWithPagination/transformInput';
import { transformResults as transformResultSearch } from '../../presets/pg/searchWithPagination/transformResult';

import {
  result as resultSchema,
  inputSearch as inputSearchSchema,
} from './schema';
import { pg as pgData } from './pg';
import * as transformTxInfo from './transformTxInfo';

const createServiceName = (type: string): string => `transactions.data.${type}`;

type DataTxsSearchRequest = CommonFilters &
  WithSortOrder &
  WithLimit &
  Partial<{
    key: string;
    type: string;
    value: string;
  }>;

type DataEntry = {
  key: string;
  type: string;
  value: string;
};

type DataTxDbResponse = RawTx & {
  data: DataEntry[];
};

export type DataTxsService = ServiceGet<string, Transaction> &
  ServiceMget<string[], Transaction> &
  ServiceSearch<DataTxsSearchRequest, Transaction>;

export default ({
  drivers: { pg },
  emitEvent,
}: CommonServiceCreatorDependencies): DataTxsService => {
  return {
    get: get<string, string, DataTxDbResponse, Transaction>({
      transformInput: identity,
      transformResult: transformResultGet<
        string,
        DataTxDbResponse,
        TransactionInfo,
        Transaction
      >(transaction)(transformTxInfo),
      validateInput: validateInput(inputGet, createServiceName('get')),
      validateResult: validateResult(resultSchema, createServiceName('get')),
      dbQuery: pgData.get,
    })({ db: pg, emitEvent }),

    mget: mget<string[], string[], DataTxDbResponse, List<Transaction>>({
      transformInput: identity,
      transformResult: transformResultMget<
        string[],
        DataTxDbResponse,
        TransactionInfo,
        Transaction
      >(transaction)(transformTxInfo),
      validateInput: validateInput(inputMget, createServiceName('mget')),
      validateResult: validateResult(resultSchema, createServiceName('mget')),
      dbQuery: pgData.mget,
    })({ db: pg, emitEvent }),

    search: search<
      DataTxsSearchRequest,
      DataTxsSearchRequest,
      DataTxDbResponse,
      List<Transaction>
    >({
      transformInput: transformInputSearch,
      transformResult: transformResultSearch(
        compose(
          transaction,
          transformTxInfo
        )
      ),
      validateInput: validateInput(
        inputSearchSchema,
        createServiceName('search')
      ),
      validateResult: validateResult(resultSchema, createServiceName('search')),
      dbQuery: pgData.search,
    })({ db: pg, emitEvent }),
  };
};
