import { createCachedSelector } from 're-reselect';
import type { BeefyState } from '../store/types.ts';
import type { KeysOfType } from '../utils/types-utils.ts';
import type { RevenueState } from '../reducers/revenue.ts';

export const selectCurrentWeekRevenue = (state: BeefyState) => state.ui.revenue.currentWeek;

export const selectCurrentWeekRevenueStat = createCachedSelector(
  selectCurrentWeekRevenue,
  (_state: BeefyState, key: KeysOfType<RevenueState['currentWeek'], BigNumber>) => key,
  (currentWeek, key) => currentWeek[key]
)((_state: BeefyState, key: KeysOfType<RevenueState['currentWeek'], BigNumber>) => key);
