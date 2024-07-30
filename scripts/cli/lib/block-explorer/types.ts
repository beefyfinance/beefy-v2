import { Address, Hash, Hex } from 'viem';

export type Log = {
  address: Address;
  topics: [Hash, ...Hash[]];
  data: Hex;
  blockNumber: bigint;
  blockHash: Hash;
  timestamp: number;
  logIndex: number;
  transactionHash: Hash;
  transactionIndex: number;
};

type NextPageFn<T> = () => Promise<Result<T>>;

export type Result<T> = {
  success: true;
  result: T;
  next: false | NextPageFn<T>;
};

export class BlockExplorerError<T> extends Error {
  constructor(public readonly cause: Error, public readonly retry: NextPageFn<T>) {
    super(cause.message, { cause });
    this.name = 'BlockExplorerError';
  }
}

export interface IBlockExplorer {
  getLogs(address: Address, topics: Hash[]): Promise<Result<Log[]>>;
}
