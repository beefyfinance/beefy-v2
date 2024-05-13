export type MerklUserRewardsRequest = {
  user: string;
  chainId: number;
  proof?: boolean;
};

export type MerklUserRewardsResponse = {
  [tokenAddress: string]: {
    accumulated: string;
    decimals: number;
    symbol: string;
    unclaimed: string;
    reasons: {
      [reason: string]: {
        accumulated: string;
        unclaimed: string;
      };
    };
    proof: string[];
  };
};

export interface IMerklRewardsApi {
  fetchUserRewards(request: MerklUserRewardsRequest): Promise<MerklUserRewardsResponse>;
}
