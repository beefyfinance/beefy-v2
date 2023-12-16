import type { BeefyState } from '../../../redux-types';
import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import {
  fetchAllBalanceAction,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../actions/balance';
import { initiateBoostForm } from '../actions/boosts';
import { initiateMinterForm } from '../actions/minters';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';

const balanceListener = createListenerMiddleware<BeefyState>();

balanceListener.startListening({
  matcher: isFulfilled(
    fetchAllBalanceAction,
    fetchBalanceAction,
    initiateBoostForm,
    initiateMinterForm,
    reloadBalanceAndAllowanceAndGovRewardsAndBoostData
  ),
  effect: async (action, { dispatch, delay, cancelActiveListeners }) => {
    // Cancel other instances of this callback
    cancelActiveListeners();

    // Debounce
    await delay(50);

    // Compute vault zap support
    dispatch(recalculateDepositedVaultsAction({ walletAddress: action.payload.walletAddress }));
  },
});

export const balanceMiddleware = balanceListener.middleware;
