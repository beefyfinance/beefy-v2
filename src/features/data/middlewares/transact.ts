import type { UnknownAction } from 'redux';
import { fetchFees } from '../actions/fees.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { transactInit, transactInitReady, transactSwitchMode } from '../actions/transact.ts';
import { fetchUserOffChainRewardsForVaultAction } from '../actions/user-rewards/user-rewards.ts';
import {
  calculateZapAvailabilityAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap.ts';
import { isVaultActive } from '../entities/vault.ts';
import { TransactMode, TransactStep } from '../reducers/wallet/transact-types.ts';
import { selectUserVaultBalanceInShareTokenInBoosts } from '../selectors/balance.ts';
import { selectBoostById, selectIsVaultPreStakedOrBoosted } from '../selectors/boosts.ts';
import { selectAllChainIds } from '../selectors/chains.ts';
import { selectIsConfigAvailable } from '../selectors/config.ts';
import { selectAreFeesLoaded, selectShouldInitFees } from '../selectors/fees.ts';
import { selectIsPricesAvailable } from '../selectors/prices.ts';
import { selectIsAddressBookLoaded } from '../selectors/tokens.ts';
import {
  selectTransactMode,
  selectTransactPendingVaultIdOrUndefined,
  selectTransactStep,
  selectTransactVaultIdOrUndefined,
} from '../selectors/transact.ts';
import { selectMayHaveOffchainUserRewards } from '../selectors/user-rewards.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import {
  selectIsZapLoaded,
  selectShouldInitZapAggregatorTokenSupport,
  selectShouldInitZapAmms,
  selectShouldInitZapConfigs,
  selectShouldInitZapSwapAggregators,
} from '../selectors/zap.ts';
import { startAppListening } from './listener-middleware.ts';

export function addTransactListeners() {
  /** calculate zap availability after all needed data is loaded */
  startAppListening({
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
  startAppListening({
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
      const loaders: Promise<UnknownAction>[] = [];
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

  /** switch away from boost tab if unstaked from all boosts */
  startAppListening({
    actionCreator: reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
    effect: async (action, { getState, dispatch }) => {
      if (
        !action.meta.arg.walletAddress ||
        !action.meta.arg.boostId ||
        !action.payload.balance.boosts.length
      ) {
        // this is not a user boost balance update
        return;
      }

      const state = getState();
      const step = selectTransactStep(state);
      if (step !== TransactStep.Form) {
        // not on form step
        return;
      }

      const mode = selectTransactMode(state);
      if (mode !== TransactMode.Boost) {
        // not on boost form tab
        return;
      }

      const boost = selectBoostById(state, action.meta.arg.boostId);
      const vaultId = selectTransactVaultIdOrUndefined(state);
      if (!vaultId || vaultId !== boost.vaultId) {
        // not on the same vault this boost is for
        return;
      }

      const vaultHasBoost = selectIsVaultPreStakedOrBoosted(state, boost.vaultId);
      if (vaultHasBoost) {
        // there is still a boost for this vault, so tab will not be empty
        return;
      }

      const balance = selectUserVaultBalanceInShareTokenInBoosts(
        state,
        boost.vaultId,
        action.meta.arg.walletAddress
      );
      if (!balance.isZero()) {
        // still have balance in some boost of this vault
        return;
      }

      // switch to deposit if vault still active, otherwise withdraw tab
      const vault = selectVaultById(state, vaultId);
      dispatch(
        transactSwitchMode(isVaultActive(vault) ? TransactMode.Deposit : TransactMode.Withdraw)
      );
    },
  });
}
