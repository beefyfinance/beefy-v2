import type { BeefyState } from '../store/types';
export declare const selectLastViewedVaultsVaultId: (state: BeefyState) => string | undefined;
export declare const selectLastViewedDashboardVaultId: (state: BeefyState) => string | undefined;
/** vault list is available as soon as we load the config */
export declare const selectIsVaultListAvailable: import("./data-loader-helpers").GlobalDataSelectorFn;
