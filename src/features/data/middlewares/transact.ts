import type { BeefyState } from '../../../redux-types';
import { type AnyAction, createListenerMiddleware } from '@reduxjs/toolkit';
import {
  selectIsAddressBookLoaded,
  selectIsConfigAvailable,
  selectIsPriceAvailable,
  selectIsZapLoaded,
  selectShouldInitZapAggregatorTokenSupport,
  selectShouldInitZapAmms,
  selectShouldInitZapConfigs,
  selectShouldInitZapSwapAggregators,
} from '../selectors/data-loader';
import { selectAllChainIds } from '../selectors/chains';
import {
  calculateZapAvailabilityAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap';
import { transactInit, transactInitReady } from '../actions/transact';
import { selectVaultById } from '../selectors/vaults';
import { fetchFees } from '../actions/fees';
import { selectAreFeesLoaded, selectShouldInitFees } from '../selectors/fees';
import { selectTransactPendingVaultIdOrUndefined } from '../selectors/transact';

const transactListener = createListenerMiddleware<BeefyState>();

/** calculate zap availability after all needed data is loaded */
transactListener.startListening({
  actionCreator: fetchZapAggregatorTokenSupportAction.fulfilled,
  effect: async (_, { dispatch, condition, cancelActiveListeners }) => {
    // Cancel other listeners
    cancelActiveListeners();

    // Wait for all data to be loaded
    await condition((_, state): boolean => {
      if (!selectIsConfigAvailable(state)) {
        return false;
      }
      const chainIds = selectAllChainIds(state);
      if (!chainIds.every(chainId => selectIsAddressBookLoaded(state, chainId))) {
        return false;
      }

      if (!selectIsPriceAvailable(state)) {
        return false;
      }

      return selectIsZapLoaded(state);
    });

    // Compute vault zap support
    dispatch(calculateZapAvailabilityAction());
  },
});

/** init transact form and wait for data to finish loading */
transactListener.startListening({
  actionCreator: transactInit,
  effect: async (action, { dispatch, condition, getState, signal }) => {
    const shouldCancel = () => {
      // another transactInit was dispatched with a different vault id
      if (selectTransactPendingVaultIdOrUndefined(getState()) !== action.payload.vaultId) {
        return true;
      }
      // was cancelled via externally
      return signal.aborted;
    };

    if (shouldCancel()) {
      return;
    }

    // Loaders for these are dispatched in initAppData
    const vault = selectVaultById(getState(), action.payload.vaultId);
    await condition(
      (_, currentState) =>
        selectIsConfigAvailable(currentState) &&
        selectIsAddressBookLoaded(currentState, vault.chainId)
    );

    if (shouldCancel()) {
      return;
    }

    // Init zap data loaders
    const loaders: Promise<AnyAction>[] = [];
    if (selectShouldInitZapAmms(getState())) {
      loaders.push(dispatch(fetchZapAmmsAction()));
    }

    if (selectShouldInitZapConfigs(getState())) {
      loaders.push(dispatch(fetchZapConfigsAction()));
    }

    if (selectShouldInitZapSwapAggregators(getState())) {
      loaders.push(dispatch(fetchZapSwapAggregatorsAction()));
    }

    if (selectShouldInitZapAggregatorTokenSupport(getState())) {
      loaders.push(dispatch(fetchZapAggregatorTokenSupportAction()));
    }

    // Init fees data loader
    if (selectShouldInitFees(getState())) {
      loaders.push(dispatch(fetchFees()));
    }

    // Wait for all loaders to finish
    await Promise.allSettled(loaders);

    if (shouldCancel()) {
      return;
    }

    // Wait for all data to be loaded (in case we didn't dispatch the above loaders)
    await condition(
      (_, currentState) => selectAreFeesLoaded(currentState) && selectIsZapLoaded(currentState)
    );

    if (shouldCancel()) {
      return;
    }

    dispatch(transactInitReady({ vaultId: action.payload.vaultId }));
  },
});

export const transactMiddleware = transactListener.middleware;
