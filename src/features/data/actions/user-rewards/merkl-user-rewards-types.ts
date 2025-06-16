import type { ChainId } from '../../entities/chain.ts';
import type {
  MerklTokenReward,
  MerklVaultReward,
} from '../../reducers/wallet/user-rewards-types.ts';

export type FetchUserMerklRewardsActionParams = {
  walletAddress: string;
  /** optionally request merkl api to bypass cache for this chain id */
  reloadChainId?: ChainId;
};

export type FetchUserMerklRewardsFulfilledPayload = {
  walletAddress: string;
  byChainId: Record<ChainId, MerklTokenReward[]>;
  byVaultId: Record<string, MerklVaultReward[]>;
};
