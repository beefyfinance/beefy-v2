import type { BeefyState } from '../../../redux-types';
import {
  fetchClmHarvestsForUser,
  fetchClmHarvestsForUserChain,
  fetchClmHarvestsForUserVault,
  fetchWalletTimeline,
  recalculateClmHarvestsForUserVaultId,
} from '../actions/analytics';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  selectIsConfigAvailable,
  selectIsWalletTimelineForUserPending,
  selectIsGlobalAddressBookAvailable,
  selectIsUserBalanceAvailable,
  selectIsWalletTimelineForUserRecent,
} from '../selectors/data-loader';
import { depositedVaultsAddedAction, recalculateDepositedVaultsAction } from '../actions/balance';
import { createWalletDebouncer } from '../../../helpers/middleware';
import { selectUserDepositedTimelineByVaultId } from '../selectors/analytics';
import { selectIsVaultGov } from '../selectors/vaults';

const analyticsListener = createListenerMiddleware<BeefyState>();

const timelineDebouncer = createWalletDebouncer(100);

/**
 * Fetch the user's wallet timeline after we detect a new vault with a deposit
 */
analyticsListener.startListening({
  actionCreator: depositedVaultsAddedAction,
  effect: async (action, { dispatch, getState, delay, condition }) => {
    const state = getState();
    const { walletAddress, vaultIds } = action.payload;
    // Skip if already pending or fetched recently
    if (
      selectIsWalletTimelineForUserPending(state, walletAddress) ||
      selectIsWalletTimelineForUserRecent(state, walletAddress)
    ) {
      return;
    }

    // Only if new standard or clm vault that we don't have timeline data for
    const missingVaultIds = vaultIds.filter(
      v =>
        !selectIsVaultGov(state, v) &&
        selectUserDepositedTimelineByVaultId(state, walletAddress, v) === undefined
    );

    if (!missingVaultIds.length) {
      return;
    }

    // Make sure data that fetchWalletTimeline needs is available
    await condition(
      (_, currentState) =>
        selectIsConfigAvailable(currentState) &&
        selectIsGlobalAddressBookAvailable(currentState) &&
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
        selectIsGlobalAddressBookAvailable(currentState) &&
        selectIsUserBalanceAvailable(currentState, walletAddress)
    );

    // Recalculate the user's deposited vaults
    await dispatch(recalculateDepositedVaultsAction({ walletAddress }));

    // Fetch the CLM harvests for vaults the user is deposited in
    dispatch(fetchClmHarvestsForUser({ walletAddress }));
  },
});

/**
 * Recalculate each vaults autocompounded amounts after fetching the CLM harvests for the user
 */
analyticsListener.startListening({
  actionCreator: fetchClmHarvestsForUserChain.fulfilled,
  effect: async (action, { dispatch }) => {
    const walletAddress = action.meta.arg.walletAddress;
    for (const { vaultId } of action.payload) {
      dispatch(recalculateClmHarvestsForUserVaultId({ walletAddress, vaultId }));
    }
  },
});

analyticsListener.startListening({
  actionCreator: fetchClmHarvestsForUserVault.fulfilled,
  effect: async (action, { dispatch }) => {
    const { vaultId, walletAddress } = action.meta.arg;
    dispatch(recalculateClmHarvestsForUserVaultId({ walletAddress, vaultId }));
  },
});

export const analyticsMiddleware = analyticsListener.middleware;
