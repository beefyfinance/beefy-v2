import type { BeefyState } from '../../../redux-types.ts';
import { type AnyAction, createListenerMiddleware } from '@reduxjs/toolkit';
import {
  selectIsAddressBookLoaded,
  selectIsConfigAvailable,
  selectIsPricesAvailable,
  selectIsZapLoaded,
  selectShouldInitZapAggregatorTokenSupport,
  selectShouldInitZapAmms,
  selectShouldInitZapConfigs,
  selectShouldInitZapSwapAggregators,
} from '../selectors/data-loader.ts';
import { selectAllChainIds } from '../selectors/chains.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { selectTransactPendingVaultIdOrUndefined } from '../selectors/transact.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import { selectAreFeesLoaded, selectShouldInitFees } from '../selectors/fees.ts';
import {
  calculateZapAvailabilityAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap.ts';
import { transactInit, transactInitReady } from '../actions/transact.ts';
import { fetchFees } from '../actions/fees.ts';
import { fetchUserOffChainRewardsForVaultAction } from '../actions/user-rewards/user-rewards.ts';
import { selectMayHaveOffchainUserRewards } from '../selectors/user-rewards.ts';

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

      if (!selectIsPricesAvailable(state)) {
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

    // Deposit/Withdraw: Init zap data loaders
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

    // Deposit/Withdraw: Init fees data loader
    if (selectShouldInitFees(getState())) {
      loaders.push(dispatch(fetchFees()));
    }

    // Claim: Init user off-chain rewards data loader
    const mayHaveOffchainRewards = selectMayHaveOffchainUserRewards(getState(), vault);
    const walletAddress = selectWalletAddress(getState());
    if (mayHaveOffchainRewards && walletAddress) {
      // dispatch but don't wait on it
      dispatch(fetchUserOffChainRewardsForVaultAction(vault.id, walletAddress));
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
