import type { ChainId } from '../../entities/chain.ts';
import type {
  MerklTokenReward,
  MerklVaultReward,
} from '../../reducers/wallet/user-rewards-types.ts';

export type FetchUserMerklRewardsActionParams = {
  walletAddress: string;
  force?: boolean;
};

export type FetchUserMerklRewardsFulfilledPayload = {
  walletAddress: string;
  byChainId: Record<ChainId, MerklTokenReward[]>;
  byVaultId: Record<string, MerklVaultReward[]>;
};
