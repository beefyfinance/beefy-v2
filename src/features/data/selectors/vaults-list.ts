import type { BeefyState } from '../../../redux-types.ts';

export const selectLastViewedVaultsVaultId = (state: BeefyState) => state.ui.vaultsList.vaultsLast;
export const selectLastViewedDashboardVaultId = (state: BeefyState) =>
  state.ui.vaultsList.dashboardLast;
