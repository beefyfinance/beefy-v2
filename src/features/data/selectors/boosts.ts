import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { getBoostStatusFromPeriodFinish } from '../reducers/boosts';
import { selectBoostUserBalanceInToken, selectBoostUserRewardsInToken } from './balance';

export const selectBoostById = (state: BeefyState, boostId: BoostEntity['id']) => {
  const boostsByIds = state.entities.boosts.byId;
  if (boostsByIds[boostId] === undefined) {
    throw new Error(`selectBoostById: Unknown vault id ${boostId}`);
  }
  return boostsByIds[boostId];
};

export const selectIsBoostActive = (state: BeefyState, boostId: BoostEntity['id']) => {
  const status = getBoostStatusFromPeriodFinish(selectBoostPeriodFinish(state, boostId));
  return status === 'active';
};

export const selectBoostsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.entities.boosts.byChainId[chainId]?.allBoostsIds || [];
};

export const selectIsVaultBoosted = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds.length > 0 || false;
};

export const selectIsVaultPreStakedOrBoosted = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vaultBoosts = state.entities.boosts.byVaultId[vaultId];
  return vaultBoosts?.prestakeBoostsIds.length + vaultBoosts?.activeBoostsIds.length > 0 || false;
};

export const selectActiveVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds || [];
};

export const selectPreStakeOrActiveBoost = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds.concat(
    state.entities.boosts.byVaultId[vaultId]?.prestakeBoostsIds
  );
};

export const selectAllVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.allBoostsIds || [];
};

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
