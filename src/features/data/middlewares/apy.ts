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
    console.debug('wait vaults and apys');
    await condition(
      (_action, currentState) =>
        selectIsVaultsAvailable(currentState) && selectIsApyAvailable(currentState)
    );

    // Compute total apy for frontend
    console.debug('wait apy recalc');
    await dispatch(recalculateTotalApyAction());

    // Make sure we have avg apys
    console.debug('wait avg apys');
    await condition((_action, currentState) => selectIsAvgApyAvailable(currentState));

    // Compute average apy for frontend
    console.debug('wait avg apy recalc');
    console.log(await dispatch(recalculateAvgApyAction()));
  },
});

export const apyMiddleware = apyListener.middleware;
