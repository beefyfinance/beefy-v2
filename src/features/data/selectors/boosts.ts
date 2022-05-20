import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { getBoostStatusFromPeriodFinish } from '../reducers/boosts';
import { selectBoostUserBalanceInToken, selectBoostUserRewardsInToken } from './balance';
import { createCachedSelector } from 're-reselect';

export const selectBoostById = createCachedSelector(
  (state: BeefyState) => state.entities.boosts.byId,
  (state: BeefyState, boostId: BoostEntity['id']) => boostId,
  (boostsById, boostId) => {
    if (boostsById[boostId] === undefined) {
      throw new Error(`selectBoostById: Unknown boost id ${boostId}`);
    }
    return boostsById[boostId];
  }
)((state: BeefyState, boostId: BoostEntity['id']) => boostId);

export const selectIsBoostActive = (state: BeefyState, boostId: BoostEntity['id']) => {
  const status = getBoostStatusFromPeriodFinish(selectBoostPeriodFinish(state, boostId));
  return status === 'active';
};

export const selectIsBoostActiveOrPreStake = (state: BeefyState, boostId: BoostEntity['id']) => {
  const status = getBoostStatusFromPeriodFinish(selectBoostPeriodFinish(state, boostId));
  return status === 'active' || status === 'prestake';
};

export const selectBoostsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.entities.boosts.byChainId[chainId]?.allBoostsIds || [];
};

export const selectIsVaultBoosted = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  activeBoostIds => activeBoostIds.length > 0
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultPreStakedOrBoosted = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectPreStakeVaultBoostIds(state, vaultId),
  (activeBoostIds, prestakeBoostIds) => activeBoostIds.length + prestakeBoostIds.length > 0
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectActiveVaultBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds,
  boostIds => boostIds || []
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPreStakeVaultBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.boosts.byVaultId[vaultId]?.prestakeBoostsIds,
  boostIds => boostIds || []
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPreStakeOrActiveBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectActiveVaultBoostIds(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectPreStakeVaultBoostIds(state, vaultId),
  (activeBoostIds, prestakeBoostIds) => activeBoostIds.concat(prestakeBoostIds)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectAllVaultBoostIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.boosts.byVaultId[vaultId]?.allBoostsIds,
  boostIds => boostIds || []
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectPastBoostIdsWithUserBalance = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  if (!state.entities.boosts.byVaultId[vaultId]) {
    return [];
  }

  const vaultBoosts = state.entities.boosts.byVaultId[vaultId];

  const boostIds = [];
  for (const eolBoostId of vaultBoosts.expiredBoostsIds) {
    const userBalance = selectBoostUserBalanceInToken(state, eolBoostId);
    if (userBalance.gt(0)) {
      boostIds.push(eolBoostId);
      continue;
    }
    const userRewards = selectBoostUserRewardsInToken(state, eolBoostId);
    if (userRewards.gt(0)) {
      boostIds.push(eolBoostId);
      continue;
    }
  }
  return boostIds;
};

export const selectShouldDisplayBoostWidget = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!state.entities.boosts.byVaultId[vaultId]) {
    return false;
  }

  const vaultBoosts = state.entities.boosts.byVaultId[vaultId];

  // has an active boost
  if (vaultBoosts.activeBoostsIds.length > 0) {
    return true;
  }
  // has a prestaking boost
  if (vaultBoosts.prestakeBoostsIds.length > 0) {
    return true;
  }

  // OR, there was an ended boost and user staked into it
  if (selectPastBoostIdsWithUserBalance(state, vaultId).length > 0) {
    return true;
  }

  return false;
};

export const selectBoostPeriodFinish = (state: BeefyState, boostId: BoostEntity['id']) => {
  return state.entities.boosts.periodFinish[boostId] || null;
};
