import type { Address } from 'viem';

export type StellaSwapRewardsRequest = {
  user: string;
};

export type StellaSwapPoolRewardsRequest = {
  pool: string;
  user: string;
};

type StellaSwapSuccessResponse<T> = {
  status: 'success';
  message: string;
  data: T;
};

type StellaSwapErrorResponse = {
  status: 'error';
  message: string;
};

type StellaSwapResponse<T> = StellaSwapSuccessResponse<T> | StellaSwapErrorResponse;

export type StellaSwapPoolRewards = {
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

export type StellaSwapRewardsResponse = StellaSwapResponse<{
  pools: Array<StellaSwapPoolRewards>;
}>;
export type StellaSwapPoolRewardsResponse = StellaSwapResponse<StellaSwapPoolRewards>;

export interface IStellaSwapRewardsApi {
  fetchRewards(request: StellaSwapRewardsRequest): Promise<StellaSwapRewardsResponse>;
  fetchRewardForPool(request: StellaSwapPoolRewardsRequest): Promise<StellaSwapPoolRewardsResponse>;
}
