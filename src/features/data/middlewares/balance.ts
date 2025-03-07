import type { BeefyState } from '../../../redux-types.ts';
import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import {
  fetchAllBalanceAction,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../actions/balance.ts';
import { initiateBoostForm } from '../actions/boosts.ts';
import { initiateMinterForm } from '../actions/minters.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { createWalletDebouncer } from '../../../helpers/middleware.ts';

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
