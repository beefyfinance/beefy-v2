import type { BeefyState } from '../../../redux-types.ts';

export const selectAppVersionInfo = (state: BeefyState) => state.ui.version;
