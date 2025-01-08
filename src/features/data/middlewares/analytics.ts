import type { BeefyState } from '../../../redux-types';
import {
  fetchClmHarvestsForUser,
  fetchClmHarvestsForVaultsOfUserOnChain,
  fetchWalletTimeline,
  recalculateClmPoolHarvestsForUserVaultId,
  recalculateClmVaultHarvestsForUserVaultId,
} from '../actions/analytics';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  selectIsAddressBookLoadedGlobal,
  selectIsConfigAvailable,
  selectIsUserBalanceAvailable,
  selectIsWalletTimelineForUserPending,
  selectIsWalletTimelineForUserRecent,
} from '../selectors/data-loader';
import { recalculateDepositedVaultsAction } from '../actions/balance';
import { createWalletDebouncer } from '../../../helpers/middleware';
import { selectUserDepositedTimelineByVaultId } from '../selectors/analytics';

const analyticsListener = createListenerMiddleware<BeefyState>();

const timelineDebouncer = createWalletDebouncer(100);

/**
 * Fetch the user's wallet timeline after we detect a new vault with a deposit
 */
analyticsListener.startListening({
  actionCreator: recalculateDepositedVaultsAction.fulfilled,
  effect: async (action, { dispatch, getState, delay, condition }) => {
    const { walletAddress, addedVaultIds } = action.payload;
    if (!addedVaultIds.length || action.meta.arg.fromTimelineListener) {
      return;
    }

    // Skip if already pending or fetched recently
    const state = getState();
    if (
      selectIsWalletTimelineForUserPending(state, walletAddress) ||
      selectIsWalletTimelineForUserRecent(state, walletAddress)
    ) {
      return;
    }

    // Only if new standard or clm vault that we don't have timeline data for
    const missingVaultIds = addedVaultIds.filter(
      v => selectUserDepositedTimelineByVaultId(state, walletAddress, v) === undefined
    );

    if (!missingVaultIds.length) {
      return;
    }

    // Make sure data that fetchWalletTimeline needs is available
    await condition(
      (_, currentState) =>
        selectIsConfigAvailable(currentState) &&
        selectIsAddressBookLoadedGlobal(currentState) &&
        selectIsUserBalanceAvailable(currentState, walletAddress)
    );

    // Debounce the timeline fetch for the specified user
    if (await timelineDebouncer(walletAddress, delay)) {
      return;
    }

    dispatch(fetchWalletTimeline({ walletAddress }));
  },
});

/**
 * Fetch CLM harvests for all vaults the user is in after fetching that user's wallet timeline
 */
analyticsListener.startListening({
  actionCreator: fetchWalletTimeline.fulfilled,
  effect: async (action, { dispatch, condition }) => {
    const walletAddress = action.meta.arg.walletAddress;

    // Wait for needed data
    await condition(
      (_, currentState) =>
        selectIsConfigAvailable(currentState) &&
        selectIsAddressBookLoadedGlobal(currentState) &&
        selectIsUserBalanceAvailable(currentState, walletAddress)
    );

    // Recalculate the user's deposited vaults
    await dispatch(recalculateDepositedVaultsAction({ walletAddress, fromTimelineListener: true }));

    // Fetch the CLM harvests for vaults the user is deposited in
    dispatch(fetchClmHarvestsForUser({ walletAddress }));
  },
});

/**
 * Recalculate each vaults autocompounded amounts after fetching the CLM harvests for the user
 */
analyticsListener.startListening({
  actionCreator: fetchClmHarvestsForVaultsOfUserOnChain.fulfilled,
  effect: async (action, { dispatch }) => {
    const walletAddress = action.meta.arg.walletAddress;
    for (const { vaultId, type } of action.payload) {
      if (type === 'clm') {
        dispatch(recalculateClmPoolHarvestsForUserVaultId({ walletAddress, vaultId }));
      } else {
        dispatch(recalculateClmVaultHarvestsForUserVaultId({ walletAddress, vaultId }));
      }
    }
  },
});

export const analyticsMiddleware = analyticsListener.middleware;
