import type { Address } from 'viem';
import type { ChainId } from '../../entities/chain.ts';
import type BigNumber from 'bignumber.js';

export type RewardToken = {
  decimals: number;
  symbol: string;
  address: Address;
  chainId: ChainId;
};

export type MerklVaultReward = {
  campaignIds: string[];
  token: RewardToken;
  accumulated: BigNumber;
  unclaimed: BigNumber;
};

export type MerklTokenReward = {
  token: RewardToken;
  accumulated: BigNumber;
  unclaimed: BigNumber;
  proof: string[];
};

export type MerklRewardsState = {
  byVaultId: {
    [vaultId: string]: MerklVaultReward[];
  };
  byChainId: {
    [chainId in ChainId]?: MerklTokenReward[];
  };
};

export type StellaSwapVaultReward = {
  position: number;
  token: RewardToken;
  proofs: string[];
  isNative: boolean;
  accumulated: BigNumber;
  unclaimed: BigNumber;
  claimContractAddress: string;
};

export type StellaSwapRewardsState = {
  byVaultId: {
    [vaultId: string]: StellaSwapVaultReward[];
  };
};

export type UserRewardsState = {
  byUser: {
    [userAddress: string]: {
      byProvider: {
        merkl: MerklRewardsState;
        stellaswap: StellaSwapRewardsState;
      };
    };
  };
};
