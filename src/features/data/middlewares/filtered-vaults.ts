import { isAnyOf, isFulfilled } from '@reduxjs/toolkit';
import { recalculateAvgApyAction, recalculateTotalApyAction } from '../actions/apy.ts';
import {
  fetchAllBalanceAction,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../actions/balance.ts';
import { fetchChainConfigs } from '../actions/chains.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import { fetchPlatforms } from '../actions/platforms.ts';
import { fetchAllPricesAction } from '../actions/prices.ts';
import { initPromos, promosRecalculatePinned } from '../actions/promos.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import { calculateZapAvailabilityAction } from '../actions/zap.ts';
import { storeFilters } from '../reducers/filtered-vaults-storage.ts';
import { filteredVaultsActions } from '../reducers/filtered-vaults.ts';
import { diffFilterValues } from '../utils/filter-values.ts';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet.ts';
import { selectActiveChainIds } from '../selectors/chains.ts';
import { selectIsConfigAvailable } from '../selectors/data-loader/config.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import { startAppListening } from './listener-middleware.ts';

const hasDataLoaded = isFulfilled(fetchChainConfigs, fetchAllVaults, fetchPlatforms, initPromos);

const hasDataChanged = isFulfilled(
  fetchAllPricesAction,
  fetchAllBalanceAction,
  fetchBalanceAction,
  fetchAllContractDataByChainAction,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
  recalculateDepositedVaultsAction,
  calculateZapAvailabilityAction,
  recalculateTotalApyAction,
  recalculateAvgApyAction
);

const hasPendingChanged = isAnyOf(
  filteredVaultsActions.reset,
  filteredVaultsActions.set,
  filteredVaultsActions.update
);

const hasWalletChanged = isAnyOf(
  userDidConnect,
  accountHasChanged,
  walletHasDisconnected,
  chainHasChanged,
  chainHasChangedToUnsupported
);

export function addFilteredVaultsListeners() {
  /**
   * This middleware persists the applied filters whenever they change
   */
  startAppListening({
    matcher: isAnyOf(
      fetchChainConfigs.fulfilled,
      filteredVaultsActions.applyPending,
      filteredVaultsActions.setFromUrl,
      filteredVaultsActions.reconcile
    ),
    effect: (_action, { getState }) => {
      storeFilters(getState().ui.filteredVaults.applied);
    },
  });

  /**
   * This middleware listens for when all actions that have loaded data have been fulfilled and recalculates the filtered vaults
   */
  startAppListening({
    matcher: hasDataLoaded,
    effect: async (
      _action,
      { dispatch, getState, condition, cancelActiveListeners, unsubscribe }
    ) => {
      // Stop listening for this
      unsubscribe();
      cancelActiveListeners();

      // Wait for all data to be loaded
      await condition((_, state): boolean => selectIsConfigAvailable(state));

      // Start listening for changes
      listenForChanges();

      // reconcile potentially outdated filters from async loaded data
      dispatch(
        filteredVaultsActions.reconcile({
          platformIds: getState().entities.platforms.allIds,
          chainIds: selectActiveChainIds(getState()),
        })
      );

      // apply pending changes dispatched before listeners started (e.g. during load)
      const slice = getState().ui.filteredVaults;
      const { filtersChanged, sortChanged } = diffFilterValues(slice.pending, slice.applied);
      if (filtersChanged || sortChanged) {
        dispatch(filteredVaultsActions.applyPending());
      }

      // Calculate
      dispatch(recalculateFilteredVaultsAction({ dataChanged: true }));
    },
  });

  function listenForChanges() {
    /**
     * This middleware listens for actions that affect vaults data and recalculates the filtered vaults
     */
    startAppListening({
      matcher: hasDataChanged,
      effect: async (_action, { dispatch, delay, cancelActiveListeners }) => {
        // Debounce a long time to give other chain data time to load
        cancelActiveListeners();
        await delay(500);

        // Recalculate
        await dispatch(promosRecalculatePinned());
        await dispatch(recalculateFilteredVaultsAction({ dataChanged: true }));
      },
    });

    /**
     * This middleware listens for actions that changes the connected wallet and recalculates the filtered vaults
     */
    startAppListening({
      matcher: hasWalletChanged,
      effect: async (
        _action,
        { dispatch, delay, cancelActiveListeners, getState, getOriginalState }
      ) => {
        const hasWalletChanged =
          selectWalletAddress(getState()) !== selectWalletAddress(getOriginalState());
        if (hasWalletChanged) {
          cancelActiveListeners();
          await delay(50);
          await dispatch(recalculateFilteredVaultsAction({ dataChanged: true }));
        }
      },
    });

    /**
     * This middleware applies pending filter changes to `applied` and recalculates the filtered vaults
     */
    startAppListening({
      matcher: hasPendingChanged,
      effect: async (_action, { dispatch, delay, getState, cancelActiveListeners }) => {
        // debounce to batch filter updates
        cancelActiveListeners();
        await delay(50);

        // flags come from the diff, not the action, so a cancelled run's changes are never lost
        const slice = getState().ui.filteredVaults;
        const { filtersChanged, sortChanged } = diffFilterValues(slice.pending, slice.applied);
        if (!filtersChanged && !sortChanged) {
          return;
        }

        dispatch(filteredVaultsActions.applyPending());
        await dispatch(recalculateFilteredVaultsAction({ filtersChanged, sortChanged }));
      },
    });

    /**
     * This middleware recalculates immediately when a url applies filters (setFromUrl skips the apply debounce)
     */
    startAppListening({
      matcher: isAnyOf(filteredVaultsActions.setFromUrl),
      effect: async (_action, { dispatch, cancelActiveListeners }) => {
        cancelActiveListeners();
        await dispatch(
          recalculateFilteredVaultsAction({ filtersChanged: true, sortChanged: true })
        );
      },
    });
  }
}
