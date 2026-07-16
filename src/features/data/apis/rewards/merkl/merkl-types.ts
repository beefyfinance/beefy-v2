export type MerklRewardsRequest = {
  user: string;
  chainId: number[];
  reloadChainId?: number;
};

export type MerklRewardsParams = {
  chains: string; // number as string, e.g., '1' for Ethereum, comma separated for multiple chains
  reloadChainId?: string; // number
};

export type MerklRewardsChain = {
  id: number;
  name: string;
  // icon: string;
  // Explorer: Array<{}>;
};

export type MerklRewardsToken = {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  price?: number | null;
};

export type MerklRewardsBreakdown = {
  /** e.g. BeefyStaker_0x13024a769cafc07fdf81149a9e8e79e8623d9958 */
  reason: string;
  /** wei */
  amount: string;
  /** wei */
  claimed: string;
  /** wei */
  pending: string;
  /** e.g. 0x4e9767f6cba22088b028ab7388b4afd1e5e5dbf4d9a8854367f2dbb4322b407c */
  campaignId: string;
};

export type MerklRewardsReward = {
  /** e.g. 0x2c604b16740c3b4724a70a35207429f03257eebb2e9260e9fb442da4989321ff */
  root: string;
  /** address of the user */
  receipient: string;
  /** wei */
  amount: string;
  /** wei */
  claimed: string;
  /** wei */
  pending: string;
  proofs: string[];
  token: MerklRewardsToken;
  breakdowns: MerklRewardsBreakdown[];
};

export type MerklRewardsForChain = {
  chain: MerklRewardsChain;
  rewards: MerklRewardsReward[];
};

export type MerklRewardsResponse = MerklRewardsForChain[];

export interface IMerklRewardsApi {
  fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse>;
}
