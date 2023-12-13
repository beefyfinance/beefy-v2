import type { BeefyState } from '../../../redux-types';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  selectIsAddressBookLoaded,
  selectIsConfigAvailable,
  selectIsPriceAvailable,
  selectIsZapLoaded,
} from '../selectors/data-loader';
import { selectAllChainIds } from '../selectors/chains';
import {
  calculateZapAvailabilityAction,
  fetchZapAggregatorTokenSupportAction,
} from '../actions/zap';

const zapListener = createListenerMiddleware<BeefyState>();

zapListener.startListening({
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

export const zapMiddleware = zapListener.middleware;
