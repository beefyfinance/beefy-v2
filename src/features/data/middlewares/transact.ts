import { isAnyOf } from '@reduxjs/toolkit';
import type { UnknownAction } from 'redux';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import {
  transactFetchOptions,
  transactInit,
  transactInitReady,
  transactInvalidateOptions,
  transactSwitchMode,
} from '../actions/transact.ts';
import { fetchUserOffChainRewardsForVaultAction } from '../actions/user-rewards/user-rewards.ts';
import {
  calculateZapAvailabilityAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapFeeCampaignsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap.ts';
import { getV2VRelevantChainsFor } from '../apis/transact/strategies/cross-chain/eligibility.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { isVaultActive } from '../entities/vault.ts';
import { TransactMode, TransactStatus, TransactStep } from '../reducers/wallet/transact-types.ts';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet.ts';
import { selectUserVaultBalanceInShareTokenInBoosts } from '../selectors/balance.ts';
import { selectBoostById, selectIsVaultPreStakedOrBoosted } from '../selectors/boosts.ts';
import { selectAllChainIds } from '../selectors/chains.ts';
import { selectHasBalanceSettledForChainUser } from '../selectors/data-loader/balance.ts';
import { selectIsConfigAvailable } from '../selectors/data-loader/config.ts';
import { selectIsPricesAvailable } from '../selectors/data-loader/prices.ts';
import {
  selectTransactMode,
  selectTransactOptionsStatus,
  selectTransactOptionsWalletAddress,
  selectTransactPendingVaultIdOrUndefined,
  selectTransactShouldShowMigrate,
  selectTransactStep,
  selectTransactVaultIdOrUndefined,
} from '../selectors/transact.ts';
import { selectMayHaveOffchainUserRewards } from '../selectors/user-rewards.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import type { BeefyState } from '../store/types.ts';
import { startAppListening } from './listener-middleware.ts';
import { selectAreFeesLoaded } from '../selectors/data-loader/fees.ts';
import {
  selectIsZapLoaded,
  selectShouldInitZapAggregatorTokenSupport,
  selectShouldInitZapAmms,
  selectShouldInitZapConfigs,
  selectShouldInitZapSwapAggregators,
} from '../selectors/data-loader/zap.ts';
import { selectIsAddressBookLoaded } from '../selectors/data-loader/tokens.ts';

/**
 * Vault-source options enumerate deposited-vault-ids, which are recalculated on
 * a debounce after each balance load: wait until that has caught up too.
 */
function selectIsTransactUserDataReady(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress: string
): boolean {
  const relevantChainIds = getV2VRelevantChainsFor(state, vaultId);
  if (
    !relevantChainIds.every(chainId =>
      selectHasBalanceSettledForChainUser(state, chainId, walletAddress)
    )
  ) {
    return false;
  }

  const byAddress = state.ui.dataLoader.byAddress[walletAddress.toLowerCase()];
  const lastBalanceFulfilled = Math.max(
    ...relevantChainIds.map(
      chainId => byAddress?.byChainId[chainId]?.balance.lastFulfilled?.timestamp ?? 0
    )
  );
  if (lastBalanceFulfilled === 0) {
    return true;
  }

  const depositedVaults = byAddress?.global.depositedVaults;
  const lastRecalculated = Math.max(
    depositedVaults?.lastFulfilled?.timestamp ?? 0,
    depositedVaults?.lastRejected?.timestamp ?? 0
  );
  return lastRecalculated > lastBalanceFulfilled;
}

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

      // RTK's condition() resolves off the *next* dispatched action, never the current state, so
      // an already-satisfied wait still parks until something unrelated is dispatched — on a warm
      // page that is the next poller tick, seconds away. Check first, wait only if we must.
      const waitFor = async (predicate: (state: BeefyState) => boolean) => {
        if (predicate(getState())) {
          return;
        }
        await condition((_, currentState) => predicate(currentState));
      };

      // Loaders for these are dispatched in initAppData
      const vault = selectVaultById(getState(), action.payload.vaultId);
      await waitFor(
        currentState =>
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
        loaders.push(dispatch(fetchZapFeeCampaignsAction()));
      }
      if (selectShouldInitZapSwapAggregators(getState())) {
        loaders.push(dispatch(fetchZapSwapAggregatorsAction()));
      }
      if (selectShouldInitZapAggregatorTokenSupport(getState())) {
        loaders.push(dispatch(fetchZapAggregatorTokenSupportAction()));
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
      await waitFor(currentState => {
        if (!selectAreFeesLoaded(currentState)) return false;
        if (!selectIsZapLoaded(currentState)) return false;

        const walletAddress = selectWalletAddress(currentState);
        if (!walletAddress) return true;

        return selectIsTransactUserDataReady(currentState, action.payload.vaultId, walletAddress);
      });

      if (shouldCancel()) {
        return;
      }

      const initialMode =
        action.payload.mode ??
        (selectTransactShouldShowMigrate(getState(), action.payload.vaultId) ?
          TransactMode.Migrate
        : TransactMode.Deposit);
      dispatch(transactInitReady({ vaultId: action.payload.vaultId, mode: initialMode }));
    },
  });

  /** refetch options when the connected wallet changes after they were computed, so vault-source options are included */
  startAppListening({
    // connects/account switches arrive as chainHasChanged: match broadly and diff the address
    matcher: isAnyOf(
      userDidConnect,
      accountHasChanged,
      walletHasDisconnected,
      chainHasChanged,
      chainHasChangedToUnsupported
    ),
    effect: async (
      _,
      { dispatch, condition, delay, getState, getOriginalState, cancelActiveListeners }
    ) => {
      const walletAddress = selectWalletAddress(getState());
      const previousAddress = selectWalletAddress(getOriginalState());
      if (walletAddress === previousAddress) {
        return;
      }

      const vaultId = selectTransactVaultIdOrUndefined(getState());
      if (!vaultId) {
        return;
      }

      // cancel before the guard below so a reconnect can abort a pending disconnect
      cancelActiveListeners();

      if (
        walletAddress &&
        selectTransactOptionsWalletAddress(getState()) === walletAddress &&
        selectTransactOptionsStatus(getState()) === TransactStatus.Fulfilled
      ) {
        // options already match this wallet: e.g. the disconnect+reconnect pair
        // some wallets emit while switching networks
        return;
      }

      if (walletAddress) {
        dispatch(transactInvalidateOptions());
        await condition((_, currentState) =>
          selectIsTransactUserDataReady(currentState, vaultId, walletAddress)
        );
      } else {
        // a network switch can surface as a transient disconnect; give a reconnect
        // a moment to supersede this run before we drop the wallet's options
        await delay(100);
        if (selectWalletAddress(getState())) {
          return;
        }
      }

      if (selectTransactVaultIdOrUndefined(getState()) !== vaultId) {
        return;
      }

      // invalidate again: a fetch started with pre-readiness data during the wait
      // would otherwise dedupe this corrective refetch
      dispatch(transactInvalidateOptions());
      const mode = selectTransactMode(getState());
      dispatch(
        transactFetchOptions({
          vaultId,
          // claim/boost options can not be fetched: prefetch deposit options instead
          mode:
            mode === TransactMode.Claim || mode === TransactMode.Boost ?
              TransactMode.Deposit
            : mode,
          // the wallet listener already refreshed all balances on this address change
          refreshBalances: false,
        })
      );
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
