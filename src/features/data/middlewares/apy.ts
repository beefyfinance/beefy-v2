import type { BeefyState } from '../../../redux-types';
import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import { fetchApyAction, recalculateTotalApyAction } from '../actions/apy';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';

const apyListener = createListenerMiddleware<BeefyState>();

apyListener.startListening({
  matcher: isFulfilled(
    fetchApyAction,
    fetchAllContractDataByChainAction,
    reloadBalanceAndAllowanceAndGovRewardsAndBoostData
  ),
  effect: async (action, { dispatch, delay, cancelActiveListeners }) => {
    // Cancel other instances of this callback
    cancelActiveListeners();

    // Debounce
    await delay(50);

    // Compute total apy for frontend
    dispatch(recalculateTotalApyAction());
  },
});

export const apyMiddleware = apyListener.middleware;
