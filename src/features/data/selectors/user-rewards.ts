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
import { selectVaultByIdOrUndefined } from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';
import { bigNumberEqual, numberEqual } from '../utils/selector-equality.ts';
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

type TokensByChainId = BeefyState['entities']['tokens']['byChainId'];
type PricesByOracleId = BeefyState['entities']['tokens']['prices']['byOracleId'];

function unifiedRewardEqual(a: UnifiedReward, b: UnifiedReward): boolean {
  return (
    a === b ||
    (a.token === b.token &&
      a.active === b.active &&
      numberEqual(a.apr, b.apr) &&
      bigNumberEqual(a.amount, b.amount) &&
      (a.price === b.price || (!!a.price && !!b.price && bigNumberEqual(a.price, b.price))))
  );
}

export function unifiedRewardsEqual(
  a: UnifiedReward[] | undefined,
  b: UnifiedReward[] | undefined
): boolean {
  if (a === b) {
    return true;
  }
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  return a.every((reward, i) => unifiedRewardEqual(reward, b[i]));
}

function buildUnifiedReward(
  tokensByChainId: TokensByChainId,
  pricesByOracleId: PricesByOracleId,
  balance: BigNumber,
  token: UnifiedRewardToken,
  active: boolean,
  apr: number | undefined
): UnifiedReward {
  const abToken =
    tokensByChainId[token.chainId]?.byAddress[token.address.toLowerCase()] || undefined;
  const price = abToken ? pricesByOracleId[abToken.oracleId] || BIG_ZERO : undefined;

  return {
    amount: balance,
    token: abToken ?? token,
    price,
    active,
    apr,
  };
}

function buildUnifiedMerklRewards(
  tokensByChainId: TokensByChainId,
  pricesByOracleId: PricesByOracleId,
  rewards: Pick<MerklVaultReward, 'token' | 'unclaimed'>[]
): UnifiedReward[] {
  return rewards.map(reward =>
    buildUnifiedReward(
      tokensByChainId,
      pricesByOracleId,
      reward.unclaimed,
      reward.token,
      false,
      undefined
    )
  );
}

export const selectUserMerklUnifiedRewardsForVault = createSelector(
  // group-wide on a CLM, so the reward shows on whichever member the user is looking at
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    walletAddress ? selectUserMerklRewardsForVault(state, vaultId, walletAddress) : undefined,
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectVaultActiveMerklCampaigns(state, vaultId),
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.byChainId,
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.prices.byOracleId,
  (unclaimedRewards, activeCampaigns, tokensByChainId, pricesByOracleId) => {
    if (!isNonEmptyArray(unclaimedRewards) && !isNonEmptyArray(activeCampaigns)) {
      return undefined;
    }

    const rewards: UnifiedReward[] =
      isNonEmptyArray(unclaimedRewards) ?
        buildUnifiedMerklRewards(tokensByChainId, pricesByOracleId, unclaimedRewards)
      : [];

    if (isNonEmptyArray(activeCampaigns)) {
      for (const campaign of activeCampaigns) {
        const existing = rewards.find(r => r.token.address === campaign.rewardToken.address);
        if (existing) {
          existing.active = true;
          existing.apr = (existing.apr || 0) + campaign.apr;
        } else {
          rewards.push(
            buildUnifiedReward(
              tokensByChainId,
              pricesByOracleId,
              BIG_ZERO,
              campaign.rewardToken,
              true,
              campaign.apr
            )
          );
        }
      }
    }

    return rewards;
  }
);

export const selectUserMerklUnifiedRewardsForChain = createSelector(
  (state: BeefyState, chainId: ChainEntity['id'], walletAddress: string) =>
    state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byChainId[chainId],
  (state: BeefyState, _chainId: ChainEntity['id'], _walletAddress: string) =>
    state.entities.tokens.byChainId,
  (state: BeefyState, _chainId: ChainEntity['id'], _walletAddress: string) =>
    state.entities.tokens.prices.byOracleId,
  (chainRewards, tokensByChainId, pricesByOracleId) =>
    chainRewards ?
      buildUnifiedMerklRewards(tokensByChainId, pricesByOracleId, chainRewards)
    : undefined
);

export function selectMayHaveOffchainUserRewards(_state: BeefyState, vault: VaultEntity) {
  return isCowcentratedLikeVault(vault) || vault.chainId === 'mode';
}

/** one row per token: campaigns paying the same token are one reward to the user */
export function mergeMerklRewardsByToken(rewards: MerklVaultReward[]): MerklVaultReward[] {
  const merged: MerklVaultReward[] = [];
  for (const reward of rewards) {
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
  return merged;
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

    const merged = mergeMerklRewardsByToken(
      getCowcentratedGroupIds(vault).flatMap(id => byVaultId[id] || [])
    );
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

export const selectUserStellaSwapUnifiedRewardsForVault = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    walletAddress ?
      state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.stellaswap.byVaultId[
        vaultId
      ] || undefined
    : undefined,
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectVaultActiveStellaSwapCampaigns(state, vaultId),
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.byChainId,
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.prices.byOracleId,
  (unclaimedRewards, activeCampaigns, tokensByChainId, pricesByOracleId) => {
    if (!isNonEmptyArray(unclaimedRewards) && !isNonEmptyArray(activeCampaigns)) {
      return undefined;
    }

    const rewards: UnifiedReward[] =
      isNonEmptyArray(unclaimedRewards) ?
        buildUnifiedMerklRewards(tokensByChainId, pricesByOracleId, unclaimedRewards)
      : [];

    if (isNonEmptyArray(activeCampaigns)) {
      for (const campaign of activeCampaigns) {
        const existing = rewards.find(r => r.token.address === campaign.rewardToken.address);
        if (existing) {
          existing.active = true;
          existing.apr = (existing.apr || 0) + campaign.apr;
        } else {
          rewards.push(
            buildUnifiedReward(
              tokensByChainId,
              pricesByOracleId,
              BIG_ZERO,
              campaign.rewardToken,
              true,
              campaign.apr
            )
          );
        }
      }
    }

    return rewards;
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

const selectConnectedUserStellaSwapRewardsForVault = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const walletAddress = selectWalletAddress(state);
  return walletAddress ?
      selectUserStellaSwapRewardsForVault(state, vaultId, walletAddress)
    : undefined;
};

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
