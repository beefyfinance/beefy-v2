import { createSelector } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { ChainEntity } from '../entities/chain.ts';
import {
  getCowcentratedGroupIds,
  isCowcentratedLikeVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { MerklVaultReward } from '../reducers/wallet/user-rewards-types.ts';
import type { BeefyState } from '../store/types.ts';
import { isNonEmptyArray } from '../utils/array-utils.ts';
import { selectGovVaultPendingRewards, selectGovVaultPendingRewardsWithPrice } from './balance.ts';
import {
  selectVaultActiveGovRewards,
  selectVaultActiveMerklCampaigns,
  selectVaultActiveStellaSwapCampaigns,
  type UnifiedRewardToken,
} from './rewards.ts';
import { selectTokenByAddressOrUndefined, selectTokenPriceByTokenOracleId } from './tokens.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';
import {
  selectHasMerklRewardsDispatchedRecentlyForAnyUser,
  selectHasStellaSwapRewardsDispatchedRecentlyForAnyUser,
  selectMerklRewardsForUserHasFulfilledOnce,
  selectMerklRewardsForUserIsPending,
  selectMerklRewardsForUserIsRejected,
  selectMerklRewardsForUserShouldLoad,
  selectStellaSwapRewardsForUserHasFulfilledOnce,
  selectStellaSwapRewardsForUserIsPending,
  selectStellaSwapRewardsForUserIsRejected,
  selectStellaSwapRewardsForUserShouldLoad,
} from './data-loader/user-rewards.ts';

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
  const unclaimedRewards =
    walletAddress ? selectUserMerklRewardsForVault(state, vaultId, walletAddress) : undefined;
  const activeCampaigns = selectVaultActiveMerklCampaigns(state, vaultId);

  if (!isNonEmptyArray(unclaimedRewards) && !isNonEmptyArray(activeCampaigns)) {
    return undefined;
  }

  const rewards: UnifiedReward[] =
    isNonEmptyArray(unclaimedRewards) ? selectUnifiedMerklRewards(state, unclaimedRewards) : [];

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

export function selectMayHaveOffchainUserRewards(_state: BeefyState, vault: VaultEntity) {
  return isCowcentratedLikeVault(vault) || vault.chainId === 'mode';
}

/**
 * A Merkl campaign targets one address, which for a CLM may be the manager or either wrapper.
 * Every group member reads all of them, so the reward shows wherever the user is looking, and
 * summing across the group cannot double-count. Same-token entries from different campaigns merge.
 */
export const selectUserMerklRewardsForVault = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], walletAddress: string) =>
    state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byVaultId,
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress: string) =>
    selectVaultByIdOrUndefined(state, vaultId),
  (byVaultId, vault): MerklVaultReward[] | undefined => {
    if (!byVaultId || !vault) {
      return undefined;
    }
    if (!isCowcentratedLikeVault(vault)) {
      return byVaultId[vault.id] || undefined;
    }

    const merged: MerklVaultReward[] = [];
    for (const id of getCowcentratedGroupIds(vault)) {
      for (const reward of byVaultId[id] || []) {
        const at = merged.findIndex(
          r => r.token.address === reward.token.address && r.token.chainId === reward.token.chainId
        );
        if (at === -1) {
          merged.push(reward);
        } else {
          merged[at] = {
            ...merged[at],
            campaignIds: [...new Set([...merged[at].campaignIds, ...reward.campaignIds])],
            accumulated: merged[at].accumulated.plus(reward.accumulated),
            unclaimed: merged[at].unclaimed.plus(reward.unclaimed),
          };
        }
      }
    }
    return merged.length ? merged : undefined;
  }
)(
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    `${walletAddress}-${vaultId}`
);

/**
 * Only the rewards the API attributed to this exact vault. Disjoint across a CLM group, so per-side
 * reads can be summed — unlike selectUserMerklRewardsForVault above, which unions the whole group
 * for display and would double-count if summed.
 */
export const selectUserMerklRewardsAttributedToVault = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress: string
): MerklVaultReward[] | undefined =>
  state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byVaultId[vaultId];

const selectConnectedUserMerklRewardsForVault = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): MerklVaultReward[] | undefined => {
  const walletAddress = selectWalletAddress(state);
  return walletAddress ? selectUserMerklRewardsForVault(state, vaultId, walletAddress) : undefined;
};

export const selectConnectedUserHasMerklRewardsForVault = createSelector(
  selectConnectedUserMerklRewardsForVault,
  rewards => rewards?.some(r => r.unclaimed.gt(BIG_ZERO)) || false
);

export function selectUserStellaSwapUnifiedRewardsForVault(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) {
  const unclaimedRewards =
    walletAddress ?
      state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.stellaswap.byVaultId[
        vaultId
      ] || undefined
    : undefined;
  const activeCampaigns = selectVaultActiveStellaSwapCampaigns(state, vaultId);

  if (!isNonEmptyArray(unclaimedRewards) && !isNonEmptyArray(activeCampaigns)) {
    return undefined;
  }

  const rewards: UnifiedReward[] =
    isNonEmptyArray(unclaimedRewards) ? selectUnifiedMerklRewards(state, unclaimedRewards) : [];

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
  (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
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

export const selectUserStellaSwapRewardsForVault = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress: string
) =>
  state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.stellaswap.byVaultId[
    vaultId
  ] || undefined;

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
      pendingRewards && pendingRewards.length ?
        pendingRewards.map(r => ({
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
export const selectMerklUserRewardsStatus = createSelector(
  selectMerklRewardsForUserHasFulfilledOnce,
  selectMerklRewardsForUserShouldLoad,
  selectMerklRewardsForUserIsRejected,
  selectMerklRewardsForUserIsPending,
  selectHasMerklRewardsDispatchedRecentlyForAnyUser,
  (userFulfilled, userShouldLoad, userRejected, userPending, anyUserDispatchedRecently) => ({
    canLoad: userShouldLoad && !anyUserDispatchedRecently,
    isLoaded: userFulfilled,
    isLoading: userPending,
    isError: !userFulfilled && userRejected,
  })
);
export const selectStellaSwapUserRewardsStatus = createSelector(
  selectStellaSwapRewardsForUserHasFulfilledOnce,
  selectStellaSwapRewardsForUserShouldLoad,
  selectStellaSwapRewardsForUserIsRejected,
  selectStellaSwapRewardsForUserIsPending,
  selectHasStellaSwapRewardsDispatchedRecentlyForAnyUser,
  (userFulfilled, userShouldLoad, userRejected, userPending, anyUserDispatchedRecently) => ({
    canLoad: userShouldLoad && !anyUserDispatchedRecently,
    isLoaded: userFulfilled,
    isLoading: userPending,
    isError: !userFulfilled && userRejected,
  })
);
