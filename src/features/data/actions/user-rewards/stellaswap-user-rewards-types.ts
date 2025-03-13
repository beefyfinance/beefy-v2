import type { StellaSwapVaultReward } from '../../reducers/wallet/user-rewards-types.ts';

export type FetchUserStellaSwapRewardsActionParams = {
  walletAddress: string;
  force?: boolean;
};

export type FetchUserStellaSwapRewardsFulfilledPayload = {
  walletAddress: string;
  byVaultId: Record<string, StellaSwapVaultReward[]>;
};
