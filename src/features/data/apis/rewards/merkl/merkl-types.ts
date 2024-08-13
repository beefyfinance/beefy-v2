export type MerklRewardsRequest = {
  user: string;
};

export type MerklRewardsResponse = {
  [chainId: string]: {
    campaignData: {
      [campaignId: string]: {
        [reasonId: string]: {
          accumulated: string;
          auxiliaryData1: string;
          auxiliaryData2: string;
          decimals: number;
          mainParameter: string;
          type: number;
          symbol: string;
          token: string;
          unclaimed: string;
        };
      };
    };
    tokenData: {
      [tokenAddress: string]: {
        accumulated: string;
        decimals: number;
        proof: string[];
        symbol: string;
        unclaimed: string;
      };
    };
  };
};

export interface IMerklRewardsApi {
  fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse>;
}
