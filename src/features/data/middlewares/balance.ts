import { isFulfilled } from '@reduxjs/toolkit';
import { createWalletDebouncer } from '../../../helpers/middleware.ts';
import {
  fetchAllBalanceAction,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../actions/balance.ts';
import { initiateBoostForm } from '../actions/boosts.ts';
import { initiateMinterForm } from '../actions/minters.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { startAppListening } from './listener-middleware.ts';

const hasUserBalanceChanged = isFulfilled(
  fetchAllBalanceAction,
  fetchBalanceAction,
  initiateBoostForm,
  initiateMinterForm,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData
);

export function addBalanceListeners() {
  const depositedDebouncer = createWalletDebouncer(100);

  startAppListening({
    matcher: hasUserBalanceChanged,
    effect: async (action, { dispatch, delay }) => {
      const walletAddress = action.payload.walletAddress;
      if (!walletAddress) {
        return;
      }

      if (await depositedDebouncer(walletAddress, delay)) {
        return;
      }

      // Compute user deposited vaults
      dispatch(recalculateDepositedVaultsAction({ walletAddress }));
    },
  });
}
