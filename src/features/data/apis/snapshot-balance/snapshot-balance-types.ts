import type { ChainEntity } from '../../entities/chain';

export interface SnapshotBalanceResponse {
  [chainId: ChainEntity['id']]: {
    held: number;
    gov: number;
    maxi: number;
    multichain: number;
    lp: number;
    total: number;
    isContract: string;
    label: string;
  };
}

export interface ISnapshotBalanceApi {
  getUserSnapshotBalance(address: string): Promise<SnapshotBalanceResponse>;
}
