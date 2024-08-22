import type { Address } from 'viem';

export type StellaSwapRewardsRequest = {
  pool: string;
  user: string;
};

export type StellaSwapRewardsResponse = {
  status: 'success' | 'error';
  message: string;
  data: {
    pool: Address;
    rewarder: Address;
    merklRoot: string;
    ipfsHash: string;
    liquidity: string;
    rewardInfo: Array<{
      token: Address;
      isNative: boolean;
      startTimestamp: number;
      endTimestamp: number;
      rewardPerSec: string;
      derivedMatic: string;
      name: string;
      symbol: string;
      decimals: string;
    }>;
    reportedEpoch: number;
    rewardTokens: Array<{
      position: number;
      user: Address;
      address: Address;
      proofs: Array<string>;
      amount: string;
      isNative: boolean;
      claimed: string;
      pending: string;
    }>;
    positions: Array<unknown>;
  };
};

export interface IStellaSwapRewardsApi {
  fetchRewards(request: StellaSwapRewardsRequest): Promise<StellaSwapRewardsResponse>;
}
