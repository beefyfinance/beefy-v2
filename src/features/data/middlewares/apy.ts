import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import {
  fetchApyAction,
  fetchAvgApyAction,
  recalculateAvgApyAction,
  recalculateTotalApyAction,
} from '../actions/apy.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { fetchOffChainCampaignsAction } from '../actions/rewards.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import {
  selectIsApyAvailable,
  selectIsAvgApyAvailable,
  selectIsVaultsAvailable,
} from '../selectors/data-loader.ts';

const apyListener = createListenerMiddleware<BeefyState>();

apyListener.startListening({
  matcher: isFulfilled(
    fetchApyAction,
    fetchAvgApyAction,
    fetchAllContractDataByChainAction,
    reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
    fetchOffChainCampaignsAction
  ),
  effect: async (_action, { dispatch, delay, cancelActiveListeners, condition }) => {
    // Cancel other instances of this callback
    cancelActiveListeners();

    // Debounce
    await delay(50);

    // Make sure we have vaults and raw apys
    await condition(
      (_action, currentState) =>
        selectIsVaultsAvailable(currentState) && selectIsApyAvailable(currentState)
    );

    // Compute total apy for frontend
    await dispatch(recalculateTotalApyAction());

    // Make sure we have avg apys
    await condition((_action, currentState) => selectIsAvgApyAvailable(currentState));

    // Compute average apy for frontend
    await dispatch(recalculateAvgApyAction());
  },
});

export const apyMiddleware = apyListener.middleware;
