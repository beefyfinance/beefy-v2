import type { BeefyState } from '../../../redux-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectUserVaultBalanceInShareTokenInCurrentBoost,
} from './balance.ts';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { BeefyOffChainRewardsCampaignType } from '../apis/beefy/beefy-api-types.ts';
import { isAfter } from 'date-fns';
import { orderBy } from 'lodash-es';
import { arrayOrStaticEmpty, valueOrThrow } from '../utils/selector-utils.ts';
import type { BoostRewardContractData } from '../apis/contract-data/contract-data-types.ts';
import type { BoostPromoEntity, PromoEntity } from '../entities/promo.ts';

function requireBoost(
  promosById: { [id: string]: PromoEntity | undefined },
  boostId: string
): BoostPromoEntity {
  const boost = promosById[boostId];
  if (boost === undefined || boost.type !== 'boost') {
    throw new Error(`Unknown boost id ${boostId}`);
  }
  return boost;
}

export const selectBoostById = createCachedSelector(
  (state: BeefyState) => state.entities.promos.byId,
  (_: BeefyState, boostId: BoostPromoEntity['id']) => boostId,
  requireBoost
)((_: BeefyState, boostId: BoostPromoEntity['id']) => boostId);

export const selectCurrentBoostByVaultIdOrUndefined = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultCurrentBoostId(state, vaultId),
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.entities.promos.byId,
  (boostId, promosById) => {
    return boostId ? requireBoost(promosById, boostId) : undefined;
  }
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectBoostsByChainId = (state: BeefyState, chainId: ChainEntity['id']) =>
  arrayOrStaticEmpty(state.entities.promos.byType.boost?.byChainId[chainId]?.allIds);

export const selectIsVaultBoosted = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  activeBoostIds => activeBoostIds.length > 0
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultPreStakedOrBoosted = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectPreStakeVaultBoostIds(state, vaultId),
  (activeBoostIds, prestakeBoostIds) => activeBoostIds.length + prestakeBoostIds.length > 0
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultCurrentBoostId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectPreStakeVaultBoostIds(state, vaultId),
  (activeBoostIds, prestakeBoostIds) => {
    if (activeBoostIds.length > 0) {
      return activeBoostIds[0];
    }
    if (prestakeBoostIds.length > 0) {
      return prestakeBoostIds[0];
    }
    return undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultCurrentBoostIdWithStatus = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectPreStakeVaultBoostIds(state, vaultId),
  (activeBoostIds, prestakeBoostIds): { id: string; status: 'active' | 'prestake' } | undefined => {
    if (activeBoostIds.length > 0) {
      return { id: activeBoostIds[0], status: 'active' };
    }
    if (prestakeBoostIds.length > 0) {
      return { id: prestakeBoostIds[0], status: 'prestake' };
    }
    return undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultPrestakedBoost = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectPreStakeVaultBoostIds(state, vaultId),
  prestakeBoostIds => prestakeBoostIds.length > 0
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectActiveVaultBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.promos.byVaultId[vaultId]?.byType.boost?.allIds,
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) =>
    arrayOrStaticEmpty((boostIds || []).filter(id => statusById[id] === 'active'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPreStakeVaultBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.promos.byVaultId[vaultId]?.byType.boost?.allIds,
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) =>
    arrayOrStaticEmpty((boostIds || []).filter(id => statusById[id] === 'prestake'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPreStakeOrActiveBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.promos.byVaultId[vaultId]?.byType.boost?.allIds,
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) =>
    arrayOrStaticEmpty(
      (boostIds || []).filter(id => statusById[id] === 'active' || statusById[id] === 'prestake')
    )
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectAllVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) =>
  arrayOrStaticEmpty(state.entities.promos.byVaultId[vaultId]?.byType.boost?.allIds);

export const selectPastVaultBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.promos.byVaultId[vaultId]?.byType.boost?.allIds,
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) =>
    arrayOrStaticEmpty((boostIds || []).filter(id => statusById[id] === 'inactive'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPastBoostIdsWithUserBalance = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const expiredBoostIds = selectPastVaultBoostIds(state, vaultId);

  const boostIds: string[] = [];
  for (const eolBoostId of expiredBoostIds) {
    const userBalance = selectBoostUserBalanceInToken(state, eolBoostId);
    if (userBalance.gt(0)) {
      boostIds.push(eolBoostId);
      continue;
    }
    const userRewards = selectBoostUserRewardsInToken(state, eolBoostId);
    if (userRewards?.some(r => r.amount.gt(0))) {
      boostIds.push(eolBoostId);
    }
  }
  return boostIds;
};

export const selectVaultsActiveBoostPeriodFinish = (
  state: BeefyState,
  vaultId: BoostPromoEntity['id']
) => {
  const activeBoost = selectVaultCurrentBoostIdWithStatus(state, vaultId);
  const finish = activeBoost ? selectBoostPeriodFinish(state, activeBoost.id) : new Date(0);
  return finish || new Date(0);
};

export const selectBoostPeriodFinish = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return state.entities.promos.dataByType.boost[boostId]?.periodFinish || null;
};

export const selectBoostContractState = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return (
    state.entities.promos.dataByType.boost[boostId] || { periodFinish: null, isPreStake: true }
  );
};

export const selectBoostPartnerById = (state: BeefyState, partnerId: string) => {
  return state.entities.promos.partners.byId[partnerId];
};

export const selectBoostCampaignById = (state: BeefyState, campaignId: string) => {
  return state.entities.promos.campaigns.byId[campaignId];
};

export const selectOffchainBoostCampaignByType = (
  state: BeefyState,
  type: BeefyOffChainRewardsCampaignType | undefined
) => {
  if (type === undefined) {
    return undefined;
  }
  return state.entities.promos.campaigns.byId[`offchain-${type}`];
};

const NO_REWARDS: BoostRewardContractData[] = [];
export const selectBoostRewards = createCachedSelector(
  (state: BeefyState, boostId: BoostPromoEntity['id']) => selectBoostContractState(state, boostId),
  contractData => {
    if (!contractData) {
      // tokens from config
    }
    return contractData.rewards || NO_REWARDS;
  }
)((_state: BeefyState, boostId: BoostPromoEntity['id']) => boostId);

export const selectBoostActiveRewards = createCachedSelector(
  (state: BeefyState, boostId: BoostPromoEntity['id']) => selectBoostRewards(state, boostId),
  () => Math.trunc(Date.now() / 600000), // invalidate every 60s
  rewards => {
    const now = new Date();
    return orderBy(
      rewards.filter(
        reward =>
          reward.rewardRate.gt(BIG_ZERO) &&
          (reward.isPreStake || (reward.periodFinish && isAfter(reward.periodFinish, now)))
      ),
      r => r.periodFinish?.getTime() || Number.MAX_SAFE_INTEGER,
      'desc'
    );
  }
)((_state: BeefyState, boostId: BoostPromoEntity['id']) => boostId);

export const selectBoostActiveRewardTokens = createCachedSelector(
  (state: BeefyState, boostId: BoostPromoEntity['id']) => selectBoostActiveRewards(state, boostId),
  (state: BeefyState) => state.entities.tokens.byChainId,
  (rewards, tokensByChainId) =>
    rewards.map(reward =>
      valueOrThrow(
        tokensByChainId[reward.token.chainId]?.byAddress[reward.token.address.toLowerCase()],
        `selectBoostActiveRewardTokens: Token ${reward.token.address} not found`
      )
    )
)((_state: BeefyState, boostId: BoostPromoEntity['id']) => boostId);

export const selectUserHasDepositedInActiveBoost = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInCurrentBoost(state, vaultId, maybeWalletAddress),
  balanceInCurrentBoost => {
    return balanceInCurrentBoost.gt(BIG_ZERO);
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);
