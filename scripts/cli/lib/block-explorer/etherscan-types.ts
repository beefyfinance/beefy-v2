import { Hex } from 'viem';

export type EtherscanSuccessResponse<T> = {
  status: '1';
  message: string;
  result: T;
};

export type EtherscanFailureResponse = {
  status: '0';
  message: string;
  result: unknown;
};

export type EtherscanResponse<T> = EtherscanSuccessResponse<T> | EtherscanFailureResponse;

export type EtherscanLog = {
  address: Hex;
  topics: Hex[];
  data: Hex;
  blockNumber: Hex;
  blockHash: Hex;
  timeStamp: Hex;
  gasPrice: Hex;
  gasUsed: Hex;
  logIndex: Hex;
  transactionHash: Hex;
  transactionIndex: Hex;
};

type EtherscanRequest<TModule extends string, TAction extends string, T> = T & {
  apikey: string;
  page: number;
  offset: number;
  module: TModule;
  action: TAction;
};

type EtherscanPagedRequest<TModule extends string, TAction extends string, T> = EtherscanRequest<
  TModule,
  TAction,
  T
> & {
  page: number;
  offset: number;
};

export type EtherscanLogsRequest = EtherscanPagedRequest<
  'logs',
  'getLogs',
  {
    address?: Hex;
    topic0?: Hex;
    topic1?: Hex;
    topic0_1_opr?: 'and' | 'or';
    topic2?: Hex;
    topic0_2_opr?: 'and' | 'or';
    topic1_2_opr?: 'and' | 'or';
    topic3?: Hex;
    topic0_3_opr?: 'and' | 'or';
    topic1_3_opr?: 'and' | 'or';
    topic2_3_opr?: 'and' | 'or';
  }
>;

export type EtherscanLogsReponse = EtherscanResponse<EtherscanLog[]>;
