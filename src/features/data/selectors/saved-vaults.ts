import { BeefyState } from '../../../redux-types';

export const selectSavedVaultIds = (state: BeefyState) => state.ui.savedVaults.savedVaultIds;
