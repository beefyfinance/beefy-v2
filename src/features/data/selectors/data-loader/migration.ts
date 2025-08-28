import type { BeefyState } from '../../store/types.ts';
import { isLoaderIdle } from '../data-loader-helpers.ts';

export const selectShouldInitMigration = (state: BeefyState) =>
  isLoaderIdle(state.ui.dataLoader.global.migrators);
