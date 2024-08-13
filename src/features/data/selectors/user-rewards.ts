import type { BeefyState } from '../../../redux-types';
import { type VaultEntity } from '../entities/vault';
import type { ChainEntity } from '../entities/chain';
import type { MerklVaultReward } from '../reducers/wallet/user-rewards-types';
import type { BigNumber } from 'bignumber.js';
import type { TokenEntity } from '../entities/token';
import { BIG_ZERO } from '../../../helpers/big-number';
import { createSelector } from '@reduxjs/toolkit';
import { selectTokenByAddressOrUndefined, selectTokenPriceByTokenOracleId } from './tokens';
import { selectWalletAddress } from './wallet';
import {
  selectVaultActiveGovRewards,
  selectVaultActiveMerklCampaigns,
  selectVaultActiveStellaSwapCampaigns,
} from './rewards';
import { selectGovVaultPendingRewards, selectGovVaultPendingRewardsWithPrice } from './balance';
import { isNonEmptyArray } from '../utils/array-utils';

type UnifiedRewardToken = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;

export type UnifiedReward = {
  active: boolean;
  amount: BigNumber;
  token: UnifiedRewardToken;
  price: BigNumber | undefined;
  apr: number | undefined;
};

function selectUnifiedReward(
  state: BeefyState,
  balance: BigNumber,
  token: UnifiedRewardToken,
  active: boolean,
  apr: number | undefined
): UnifiedReward {
  const abToken = selectTokenByAddressOrUndefined(state, token.chainId, token.address);
  const price = abToken ? selectTokenPriceByTokenOracleId(state, abToken.oracleId) : undefined;

  return {
    amount: balance,
    token: abToken ?? token,
    price,
    active,
    apr,
  };
}

function selectUnifiedMerklRewards(
  state: BeefyState,
  rewards: Pick<MerklVaultReward, 'token' | 'unclaimed'>[]
): UnifiedReward[] {
  return rewards.map(reward =>
    selectUnifiedReward(state, reward.unclaimed, reward.token, false, undefined)
  );
}

export function selectUserMerklUnifiedRewardsForVault(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) {
  const unclaimedRewards = walletAddress
    ? state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byVaultId[vaultId] ||
      undefined
    : undefined;
  const activeCampaigns = selectVaultActiveMerklCampaigns(state, vaultId);

  if (!isNonEmptyArray(unclaimedRewards) && !isNonEmptyArray(activeCampaigns)) {
    return undefined;
  }

  const rewards: UnifiedReward[] = isNonEmptyArray(unclaimedRewards)
    ? selectUnifiedMerklRewards(state, unclaimedRewards)
    : [];

  if (isNonEmptyArray(activeCampaigns)) {
    for (const campaign of activeCampaigns) {
      const existing = rewards.find(r => r.token.address === campaign.rewardToken.address);
      if (existing) {
        existing.active = true;
        existing.apr = (existing.apr || 0) + campaign.apr;
      } else {
        rewards.push(
          selectUnifiedReward(state, BIG_ZERO, campaign.rewardToken, true, campaign.apr)
        );
      }
    }
  }

  return rewards;
}

export function selectUserMerklUnifiedRewardsForChain(
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress: string
) {
  const chainRewards =
    state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byChainId[chainId];
  if (!chainRewards) {
    return undefined;
  }

  return selectUnifiedMerklRewards(state, chainRewards);
}

const selectConnectedUserMerklRewardsForVault = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (state: BeefyState) => state.user.rewards.byUser,
  (state: BeefyState) => selectWalletAddress(state),
  (vaultId, rewardsByUser, walletAddress) => {
    if (!walletAddress) {
      return undefined;
    }

    return (
      rewardsByUser[walletAddress.toLowerCase()]?.byProvider.merkl.byVaultId[vaultId] || undefined
    );
  }
);

export const selectConnectedUserHasMerklRewardsForVault = createSelector(
  selectConnectedUserMerklRewardsForVault,
  rewards => rewards?.some(r => r.unclaimed.gt(BIG_ZERO)) || false
);

export function selectUserStellaSwapUnifiedRewardsForVault(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) {
  const unclaimedRewards = walletAddress
    ? state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.stellaswap.byVaultId[
        vaultId
      ] || undefined
    : undefined;
  const activeCampaigns = selectVaultActiveStellaSwapCampaigns(state, vaultId);

  if (!isNonEmptyArray(unclaimedRewards) && !isNonEmptyArray(activeCampaigns)) {
    return undefined;
  }

  const rewards: UnifiedReward[] = isNonEmptyArray(unclaimedRewards)
    ? selectUnifiedMerklRewards(state, unclaimedRewards)
    : [];

  if (isNonEmptyArray(activeCampaigns)) {
    for (const campaign of activeCampaigns) {
      const existing = rewards.find(r => r.token.address === campaign.rewardToken.address);
      if (existing) {
        existing.active = true;
        existing.apr = (existing.apr || 0) + campaign.apr;
      } else {
        rewards.push(
          selectUnifiedReward(state, BIG_ZERO, campaign.rewardToken, true, campaign.apr)
        );
      }
    }
  }

  return rewards;
}

const selectConnectedUserStellaSwapRewardsForVault = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (state: BeefyState) => state.user.rewards.byUser,
  (state: BeefyState) => selectWalletAddress(state),
  (vaultId, rewardsByUser, walletAddress) => {
    if (!walletAddress) {
      return undefined;
    }

    return (
      rewardsByUser[walletAddress.toLowerCase()]?.byProvider.stellaswap.byVaultId[vaultId] ||
      undefined
    );
  }
);

export const selectConnectedUserHasStellaSwapRewardsForVault = createSelector(
  selectConnectedUserStellaSwapRewardsForVault,
  rewards => rewards?.some(r => r.unclaimed.gt(BIG_ZERO)) || false
);

export const selectConnectedUserHasGovRewardsForVault = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  walletAddress = walletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return false;
  }

  const rewards = selectGovVaultPendingRewards(state, vaultId, walletAddress);
  return rewards && rewards.some(r => r.amount.gt(BIG_ZERO));
};

export const selectUserGovVaultUnifiedRewards = createSelector(
  selectGovVaultPendingRewardsWithPrice,
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectVaultActiveGovRewards(state, vaultId),
  (pendingRewards, activeRewards): UnifiedReward[] => {
    const rewards: UnifiedReward[] =
      pendingRewards && pendingRewards.length
        ? pendingRewards.map(r => ({
            ...r,
            amount: r.amount,
            active: false,
            apr: undefined,
          }))
        : [];

    if (activeRewards && activeRewards.length) {
      for (const reward of activeRewards) {
        const existing = rewards.find(r => r.token.address === reward.token.address);
        if (existing) {
          existing.active = true;
          existing.apr = reward.apr;
        } else {
          rewards.push({
            amount: BIG_ZERO,
            token: reward.token,
            price: reward.price,
            active: true,
            apr: reward.apr,
          });
        }
      }
    }

    return rewards.filter(r => r.amount.gt(BIG_ZERO) || (r.active && r.apr));
  }
);
