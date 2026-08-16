import { createSelector } from '@reduxjs/toolkit';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { getRowAnchorId } from '../utils/vault-list-rows.ts';
import { selectIsConfigAvailable } from './data-loader/config.ts';
import { selectAllVisibleVaultIds, selectVaultByIdOrUndefined } from './vaults.ts';

export const selectLastViewedVaultsVaultId = (state: BeefyState) => state.ui.vaultsList.vaultsLast;
export const selectLastViewedDashboardVaultId = (state: BeefyState) =>
  state.ui.vaultsList.dashboardLast;
/** vault list is available as soon as we load the config */
export const selectIsVaultListAvailable = selectIsConfigAvailable;

/** The list row (anchor) id a vault renders under; itself unless it collapses into a family row */
export const selectListRowIdForVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultEntity['id'] => {
  const vault = selectVaultByIdOrUndefined(state, vaultId);
  return vault ? getRowAnchorId(vault) : vaultId;
};

/** Total list rows: visible vaults minus CLM standard vaults collapsed into their pool's row */
export const selectTotalListRowCount = createSelector(
  selectAllVisibleVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (visibleIds, byId): number =>
    visibleIds.reduce((count, id) => {
      const vault = byId[id];
      return vault && getRowAnchorId(vault) !== vault.id ? count : count + 1;
    }, 0)
);
