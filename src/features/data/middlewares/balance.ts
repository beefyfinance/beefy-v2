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
import { createWalletDebouncer } from '../../../helpers/middleware';

const balanceListener = createListenerMiddleware<BeefyState>();

const depositedDebouncer = createWalletDebouncer(100);

balanceListener.startListening({
  matcher: isFulfilled(
    fetchAllBalanceAction,
    fetchBalanceAction,
    initiateBoostForm,
    initiateMinterForm,
    reloadBalanceAndAllowanceAndGovRewardsAndBoostData
  ),
  effect: async (action, { dispatch, delay }) => {
    if (await depositedDebouncer(action.payload.walletAddress, delay)) {
      return;
    }

    // Compute user deposited vaults
    dispatch(recalculateDepositedVaultsAction({ walletAddress: action.payload.walletAddress }));
  },
});

export const balanceMiddleware = balanceListener.middleware;
