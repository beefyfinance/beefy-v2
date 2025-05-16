import type { BeefyState } from '../store/types.ts';

export const selectAppVersionInfo = (state: BeefyState) => state.ui.version;
