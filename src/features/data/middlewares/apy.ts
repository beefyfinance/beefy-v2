import type { BeefyState } from '../../../redux-types.ts';
import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { fetchApyAction, recalculateTotalApyAction } from '../actions/apy.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { fetchOffChainCampaignsAction } from '../actions/rewards.ts';

const apyListener = createListenerMiddleware<BeefyState>();

apyListener.startListening({
  matcher: isFulfilled(
    fetchApyAction,
    fetchAllContractDataByChainAction,
    reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
    fetchOffChainCampaignsAction
  ),
  effect: async (_action, { dispatch, delay, cancelActiveListeners }) => {
    // Cancel other instances of this callback
    cancelActiveListeners();

    // Debounce
    await delay(50);

    // Compute total apy for frontend
    dispatch(recalculateTotalApyAction());
  },
});

export const apyMiddleware = apyListener.middleware;
