import type { Address } from 'viem';
import type { ChainId } from '../../entities/chain';
import type { BigNumber } from 'bignumber.js';

export type MerklToken = {
  decimals: number;
  symbol: string;
  address: Address;
  chainId: ChainId;
};

export type MerklVaultReward = {
  campaignIds: string[];
  token: MerklToken;
  accumulated: BigNumber;
  unclaimed: BigNumber;
};

export type MerklTokenReward = {
  token: MerklToken;
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

export type UserRewardsState = {
  byUser: {
    [userAddress: string]: {
      byProvider: {
        merkl: MerklRewardsState;
      };
    };
  };
};
