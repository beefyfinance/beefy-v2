import { isAfter } from 'date-fns';
import { orderBy } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { BoostRewardContractData } from '../apis/contract-data/contract-data-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { BoostPromoEntity, PromoEntity } from '../entities/promo.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import {
  arrayOrStaticEmpty,
  EMPTY_ARRAY,
  valueOrThrow,
  createBoundedSelector,
} from '../utils/selector-utils.ts';

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

function selectVaultBoostIds(state: BeefyState, vaultId: VaultEntity['id']) {
  return state.entities.promos.byVaultId[vaultId]?.byType.boost?.allIds;
}

function selectVaultHasBoosts(state: BeefyState, vaultId: VaultEntity['id']) {
  return !!selectVaultBoostIds(state, vaultId)?.length;
}

const NO_BOOST_IDS = EMPTY_ARRAY;

export const selectBoostById = (state: BeefyState, boostId: BoostPromoEntity['id']) =>
  requireBoost(state.entities.promos.byId, boostId);

export const selectBoostByIdOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  boostId: string
) => {
  const promo = state.entities.promos.byId[boostId];
  if (promo === undefined || promo.type !== 'boost' || promo.chainId !== chainId) {
    return undefined;
  }
  return promo;
};

export const selectBoostByContractAddressOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  contractAddress: string
) => {
  const boostId =
    state.entities.promos.byChainId[chainId]?.byContractAddress[contractAddress.toLowerCase()];
  if (!boostId) {
    return undefined;
  }
  return selectBoostByIdOrUndefined(state, chainId, boostId);
};

export const selectCurrentBoostByVaultIdOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const boostId = selectVaultCurrentBoostId(state, vaultId);
  return boostId ? requireBoost(state.entities.promos.byId, boostId) : undefined;
};

export const selectBoostsByChainId = (state: BeefyState, chainId: ChainEntity['id']) =>
  arrayOrStaticEmpty(state.entities.promos.byType.boost?.byChainId[chainId]?.allIds);

export const selectIsVaultPreStakedOrBoosted = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectActiveVaultBoostIds(state, vaultId).length > 0 ||
  selectPreStakeVaultBoostIds(state, vaultId).length > 0;

export const selectVaultCurrentBoostId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const activeBoostIds = selectActiveVaultBoostIds(state, vaultId);
  if (activeBoostIds.length > 0) {
    return activeBoostIds[0];
  }
  const prestakeBoostIds = selectPreStakeVaultBoostIds(state, vaultId);
  if (prestakeBoostIds.length > 0) {
    return prestakeBoostIds[0];
  }
  return undefined;
};

const selectVaultCurrentBoostIdWithStatusCached = createCachedSelector(
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

export const selectVaultCurrentBoostIdWithStatus = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) =>
  selectVaultHasBoosts(state, vaultId) ?
    selectVaultCurrentBoostIdWithStatusCached(state, vaultId)
  : undefined;

export const selectIsVaultPrestakedBoost = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectPreStakeVaultBoostIds(state, vaultId).length > 0;

const selectActiveVaultBoostIdsCached = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    arrayOrStaticEmpty(selectVaultBoostIds(state, vaultId)),
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) => arrayOrStaticEmpty(boostIds.filter(id => statusById[id] === 'active'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectActiveVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectVaultHasBoosts(state, vaultId) ?
    selectActiveVaultBoostIdsCached(state, vaultId)
  : NO_BOOST_IDS;

const selectPreStakeVaultBoostIdsCached = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    arrayOrStaticEmpty(selectVaultBoostIds(state, vaultId)),
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) => arrayOrStaticEmpty(boostIds.filter(id => statusById[id] === 'prestake'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPreStakeVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectVaultHasBoosts(state, vaultId) ?
    selectPreStakeVaultBoostIdsCached(state, vaultId)
  : NO_BOOST_IDS;

const selectPreStakeOrActiveBoostIdsCached = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    arrayOrStaticEmpty(selectVaultBoostIds(state, vaultId)),
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) =>
    arrayOrStaticEmpty(
      boostIds.filter(id => statusById[id] === 'active' || statusById[id] === 'prestake')
    )
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPreStakeOrActiveBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectVaultHasBoosts(state, vaultId) ?
    selectPreStakeOrActiveBoostIdsCached(state, vaultId)
  : NO_BOOST_IDS;

export const selectAllVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) =>
  arrayOrStaticEmpty(selectVaultBoostIds(state, vaultId));

const selectPastVaultBoostIdsCached = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    arrayOrStaticEmpty(selectVaultBoostIds(state, vaultId)),
  (state: BeefyState) => state.entities.promos.statusById,
  (boostIds, statusById) => arrayOrStaticEmpty(boostIds.filter(id => statusById[id] === 'inactive'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPastVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectVaultHasBoosts(state, vaultId) ?
    selectPastVaultBoostIdsCached(state, vaultId)
  : NO_BOOST_IDS;

export const selectVaultsActiveBoostPeriodFinish = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const activeBoost = selectVaultCurrentBoostIdWithStatus(state, vaultId);
  const periodFinish = activeBoost && selectBoostPeriodFinish(state, activeBoost.id);
  return periodFinish ? periodFinish.getTime() : 0;
};

export const selectBoostPeriodFinish = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return state.entities.promos.dataByType.boost[boostId]?.periodFinish || null;
};

const NO_BOOST_CONTRACT_STATE = { periodFinish: null, isPreStake: true };

export const selectBoostContractState = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return state.entities.promos.dataByType.boost[boostId] || NO_BOOST_CONTRACT_STATE;
};

export const selectBoostPartnerById = (state: BeefyState, partnerId: string) => {
  return state.entities.promos.partners.byId[partnerId];
};

export const selectBoostCampaignById = (state: BeefyState, campaignId: string) => {
  return state.entities.promos.campaigns.byId[campaignId];
};

const NO_REWARDS: BoostRewardContractData[] = EMPTY_ARRAY;

export const selectBoostRewards = (state: BeefyState, boostId: BoostPromoEntity['id']) =>
  selectBoostContractState(state, boostId).rewards || NO_REWARDS;

export const selectBoostActiveRewards = createCachedSelector(
  (state: BeefyState, boostId: BoostPromoEntity['id']) => selectBoostRewards(state, boostId),
  () => Math.trunc(Date.now() / 600000), // reward periods expire, so the clock is a real input
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
)({
  keySelector: (_state: BeefyState, boostId: BoostPromoEntity['id']) => boostId,
  selectorCreator: createBoundedSelector,
});

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
