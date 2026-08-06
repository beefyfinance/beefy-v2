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
import {
  fetchAddressBookAction,
  fetchAllAddressBookAction,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
} from '../actions/tokens.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import { calculateZapAvailabilityAction } from '../actions/zap.ts';
import { storeFilters } from '../reducers/filtered-vaults-storage.ts';
import { filteredVaultsActions } from '../reducers/filtered-vaults.ts';
import { savedVaultsActions } from '../reducers/saved-vaults.ts';
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

const hasAddressbookLoaded = isFulfilled(fetchAllAddressBookAction, fetchAddressBookAction);

const hasFiltersChangedViaUI = isAnyOf(
  filteredVaultsActions.reset,
  filteredVaultsActions.set,
  filteredVaultsActions.update
);

const hasFiltersChanged = isAnyOf(
  hasFiltersChangedViaUI,
  filteredVaultsActions.setFromUrl,
  filteredVaultsActions.reconcile
);

const hasWalletChanged = isAnyOf(
  userDidConnect,
  accountHasChanged,
  walletHasDisconnected,
  chainHasChanged,
  chainHasChangedToUnsupported
);

export function addFilteredVaultsListeners() {
  /** Persist the pending filters whenever they change */
  startAppListening({
    matcher: hasFiltersChanged,
    effect: (_action, { getState }) => {
      const fv = getState().ui.filteredVaults;
      storeFilters(fv.pending, fv.sortPickedDuringSearch);
    },
  });

  /** Recalculate the filtered vaults and starts listening for changes after all data has loaded */
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

      // first run mark all changed
      dispatch(
        recalculateFilteredVaultsAction({
          dataChanged: true,
          filtersChanged: true,
          sortChanged: true,
        })
      );
    },
  });

  function listenForChanges() {
    /** Long debounced recalculate when global data changes */
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

    /** Short debounced recalculate when user wallet changes */
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

    /** Short debounced recalculate when user changes filteres in UI */
    startAppListening({
      matcher: hasFiltersChangedViaUI,
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

        // recalc reads pending and commits it to applied on completion
        await dispatch(recalculateFilteredVaultsAction({ filtersChanged, sortChanged }));
      },
    });

    /** Immediate recalculate when a incoming url applies filters */
    startAppListening({
      matcher: isAnyOf(filteredVaultsActions.setFromUrl),
      effect: async (_action, { dispatch, cancelActiveListeners }) => {
        cancelActiveListeners();
        await dispatch(
          recalculateFilteredVaultsAction({ filtersChanged: true, sortChanged: true })
        );
      },
    });

    /** category/platform membership depend on address book */
    startAppListening({
      matcher: hasAddressbookLoaded,
      effect: async (_action, { dispatch, delay, cancelActiveListeners }) => {
        cancelActiveListeners();
        await delay(50);
        await dispatch(recalculateFilteredVaultsAction({ filtersChanged: true }));
      },
    });

    /** Recalculate when the saved set changes while the saved category is applied */
    startAppListening({
      matcher: isAnyOf(savedVaultsActions.setSavedVaultIds),
      effect: async (_action, { dispatch, getState, cancelActiveListeners }) => {
        // skip if not on that tab
        if (getState().ui.filteredVaults.pending.userCategory !== 'saved') {
          return;
        }
        cancelActiveListeners();
        await dispatch(recalculateFilteredVaultsAction({ filtersChanged: true }));
      },
    });
  }
}
