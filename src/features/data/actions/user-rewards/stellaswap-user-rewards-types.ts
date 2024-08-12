import type { StellaSwapVaultReward } from '../../reducers/wallet/user-rewards-types';

export type FetchUserStellaSwapRewardsActionParams = {
  walletAddress: string;
  vaultId: string;
  force?: boolean;
};

export type FetchUserStellaSwapRewardsFulfilledPayload = {
  walletAddress: string;
  byVaultId: Record<string, StellaSwapVaultReward[]>;
};
