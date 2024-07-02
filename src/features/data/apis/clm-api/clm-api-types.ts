import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import type { ChainEntity } from '../../entities/chain';
import type { VaultEntity } from '../../entities/vault';

export type ApiClmHarvestPriceRow = {
  timestamp: string;
  compoundedAmount0: string;
  compoundedAmount1: string;
  token0ToUsd: string;
  token1ToUsd: string;
  totalSupply: string;
};

export type ClmVaultHarvestsResponse = ApiClmHarvestPriceRow[];

export type ClmVaultsHarvestsResponse = {
  vaultAddress: string;
  harvests: ApiClmHarvestPriceRow[];
}[];

export type ClmPendingRewardsResponse = {
  fees0: BigNumber;
  fees1: BigNumber;
  totalSupply: BigNumber;
};

export interface IClmApi {
  getHarvestsForVault(
    chainId: ChainEntity['id'],
    vaultAddress: VaultEntity['contractAddress']
  ): Promise<ClmVaultHarvestsResponse>;

  getHarvestsForVaultsSince(
    chainId: ChainEntity['id'],
    vaultAddresses: VaultEntity['contractAddress'][],
    since: Date
  ): Promise<ClmVaultsHarvestsResponse>;

  getClmPendingRewards(
    state: BeefyState,
    chainId: ChainEntity['id'],
    stratAddress: string,
    vaultAddress: VaultEntity['contractAddress']
  ): Promise<ClmPendingRewardsResponse>;
}
