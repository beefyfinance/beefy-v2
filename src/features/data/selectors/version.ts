import type { BeefyState } from '../../../redux-types';

export const selectAppVersionInfo = (state: BeefyState) => state.ui.version;
