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

export type ClmHarvestsResponse = ApiClmHarvestPriceRow[];

export type ClmPendingRewardsResponse = {
  fees0: BigNumber;
  fees1: BigNumber;
  totalSupply: BigNumber;
};

export interface IClmApi {
  getClmHarvests(
    chainId: ChainEntity['id'],
    vaultAddress: VaultEntity['earnContractAddress']
  ): Promise<ClmHarvestsResponse>;

  getClmPendingRewards(
    state: BeefyState,
    chainId: ChainEntity['id'],
    stratAddress: string,
    vaultAddress: VaultEntity['earnContractAddress']
  ): Promise<ClmPendingRewardsResponse>;
}
