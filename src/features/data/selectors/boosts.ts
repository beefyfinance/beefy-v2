import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { selectBoostUserBalanceInToken } from './balance';

export const selectBoostById = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.boosts.byId,
  // get the user passed ID
  (_: BeefyState, boostId: VaultEntity['id']) => boostId,
  // last function receives previous function outputs as parameters
  (boostsByIds, boostId) => {
    if (boostsByIds[boostId] === undefined) {
      throw new Error(`selectBoostById: Unknown vault id ${boostId}`);
    }
    return boostsByIds[boostId];
  }
);

export const selectBoostsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.entities.boosts.byChainId[chainId]?.allBoostsIds || [];
};

export const selectIsVaultBoosted = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds.length > 0 || false;
};

export const selectActiveVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds || [];
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
  return state.entities.boosts.periodfinish[boostId] || null;
};
