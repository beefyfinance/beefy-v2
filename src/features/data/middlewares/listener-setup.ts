import {
  featureFlag_logReduxActions,
  featureFlag_recordReduxActions,
  featureFlag_replayReduxActions,
} from '../utils/feature-flags.ts';
import { addAnalyticsListeners } from './analytics.ts';
import { addApyListeners } from './apy.ts';
import { addBalanceListeners } from './balance.ts';
import { addDebugLogListeners } from './debug/debug-log.ts';
import { addDebugRecordListeners } from './debug/debug-record.ts';
import { addFilteredVaultsListeners } from './filtered-vaults.ts';
import { addTransactListeners } from './transact.ts';
import { addTvlListeners } from './tvl.ts';
import { addWalletListeners } from './wallet.ts';

export function addListeners() {
  if (import.meta.env.DEV && featureFlag_recordReduxActions()) {
    addDebugRecordListeners();
  }

  // skip usual s if we are replaying actions
  if (!import.meta.env.DEV || !featureFlag_replayReduxActions()) {
    addTvlListeners();
    addBalanceListeners();
    addApyListeners();
    addTransactListeners();
    addFilteredVaultsListeners();
    addWalletListeners();
    addAnalyticsListeners();
  }

  if (import.meta.env.DEV && featureFlag_logReduxActions()) {
    addDebugLogListeners();
  }
}
