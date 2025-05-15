import type { BeefyState } from '../store/types.ts';
import { selectIsConfigAvailable } from './config.ts';

export const selectLastViewedVaultsVaultId = (state: BeefyState) => state.ui.vaultsList.vaultsLast;
export const selectLastViewedDashboardVaultId = (state: BeefyState) =>
  state.ui.vaultsList.dashboardLast;
/** vault list is available as soon as we load the config */
export const selectIsVaultListAvailable = selectIsConfigAvailable;
