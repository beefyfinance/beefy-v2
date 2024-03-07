import { type AnyAction, createAsyncThunk, miniSerializeError, nanoid } from '@reduxjs/toolkit';
import type { BeefyState, BeefyThunk } from '../../../redux-types';
import type { VaultEntity, VaultGov } from '../entities/vault';
import { selectVaultById } from '../selectors/vaults';
import { selectShouldInitAddressBook } from '../selectors/data-loader';
import { fetchAddressBookAction } from './tokens';
import { isInitialLoader } from '../reducers/data-loader-types';
import { fetchZapAmmsAction, fetchZapConfigsAction, fetchZapSwapAggregatorsAction } from './zap';
import { getTransactApi } from '../apis/instances';
import { transactActions } from '../reducers/wallet/transact';
import {
  selectTokenAmountsTotalValue,
  selectTransactDualInputAmounts,
  selectTransactDualMaxAmounts,
  selectTransactInputAmount,
  selectTransactInputMax,
  selectTransactOptionsForSelectionId,
  selectTransactOptionsMode,
  selectTransactOptionsVaultId,
  selectTransactSelectedChainId,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactSelectedSelectionId,
  selectTransactSelectionById,
  selectTransactSlippage,
  selectTransactVaultId,
  selectTransactVaultIdOrUndefined,
} from '../selectors/transact';
import type {
  InputTokenAmount,
  ITransactApi,
  QuoteOutputTokenAmountChange,
  TransactOption,
  TransactQuote,
} from '../apis/transact/transact-types';
import {
  isDepositOption,
  isDepositQuote,
  isWithdrawOption,
  isWithdrawQuote,
} from '../apis/transact/transact-types';
import { BIG_ZERO } from '../../../helpers/big-number';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { isTokenEqual, isTokenErc20 } from '../entities/token';
import { BigNumber } from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../reducers/wallet/stepper';
import { stepperActions } from '../reducers/wallet/stepper';
import { selectAllowanceByTokenAddress } from '../selectors/allowances';
import { walletActions } from './wallet-actions';
import type { ThunkAction } from 'redux-thunk';
import { startStepperWithSteps } from './stepper';
import { TransactMode } from '../reducers/wallet/transact-types';
import { selectTokenByAddress } from '../selectors/tokens';
import { groupBy, uniqBy } from 'lodash-es';
import { fetchAllowanceAction } from './allowance';
import { fetchFees } from './fees';
import { uniqueTokens } from '../../../helpers/tokens';
import { fetchBalanceAction } from './balance';
import type { Action } from 'redux';
import { selectWalletAddress } from '../selectors/wallet';
import { onlyOneInput } from '../apis/transact/helpers/options';

export type TransactInitArgs = {
  vaultId: VaultEntity['id'];
};

export type TransactInitPayload = void;

export const transactInit = createAsyncThunk<
  TransactInitPayload,
  TransactInitArgs,
  { state: BeefyState }
>(
  'transact/init',
  async ({ vaultId }, { getState, dispatch }) => {
    const vault = selectVaultById(getState(), vaultId);
    const loaders: Promise<AnyAction>[] = [];

    if (selectShouldInitAddressBook(getState(), vault.chainId)) {
      loaders.push(dispatch(fetchAddressBookAction({ chainId: vault.chainId })));
    }

    const ammsLoader = getState().ui.dataLoader.global.zapAmms;
    if (ammsLoader && isInitialLoader(ammsLoader)) {
      loaders.push(dispatch(fetchZapAmmsAction()));
    }

    const zapsLoader = getState().ui.dataLoader.global.zapConfigs;
    if (zapsLoader && isInitialLoader(zapsLoader)) {
      loaders.push(dispatch(fetchZapConfigsAction()));
    }

    const swapAggregatorsLoader = getState().ui.dataLoader.global.zapSwapAggregators;
    if (swapAggregatorsLoader && isInitialLoader(swapAggregatorsLoader)) {
      loaders.push(dispatch(fetchZapSwapAggregatorsAction()));
    }

    const feesLoader = getState().ui.dataLoader.global.fees;
    if (feesLoader && isInitialLoader(feesLoader)) {
      loaders.push(dispatch(fetchFees()));
    }

    await Promise.all(loaders);
    console.log('loaders finished');
  },
  {
    condition({ vaultId }, { getState }) {
      // only dispatch if needed
      return selectTransactVaultIdOrUndefined(getState()) !== vaultId;
    },
  }
);

export type TransactFetchOptionsArgs = {
  vaultId: VaultEntity['id'];
  mode: TransactMode;
};

export type TransactFetchOptionsPayload = {
  options: TransactOption[];
};

const optionsForByMode = {
  [TransactMode.Deposit]: 'fetchDepositOptionsFor',
  [TransactMode.Withdraw]: 'fetchWithdrawOptionsFor',
} as const satisfies Record<TransactMode, keyof ITransactApi>;

export const transactFetchOptions = createAsyncThunk<
  TransactFetchOptionsPayload,
  TransactFetchOptionsArgs,
  { state: BeefyState }
>(
  'transact/fetchOptions',
  async ({ vaultId, mode }, { getState, dispatch }) => {
    const api = await getTransactApi();
    const state = getState();
    const method = optionsForByMode[mode];
    console.log('fetchOptions', vaultId, mode);
    const options = await api[method](vaultId, getState);

    if (!options || options.length === 0) {
      throw new Error(`No transact options available.`);
    }

    // update balances
    const wallet = selectWalletAddress(state);
    if (wallet) {
      const vault = selectVaultById(state, vaultId);
      const tokens = getUniqueTokensForOptions(options, state);
      const tokensByChain = groupBy(tokens, token => token.chainId);
      await Promise.all(
        Object.values(tokensByChain).map(tokens =>
          dispatch(
            fetchBalanceAction({
              chainId: tokens[0].chainId,
              tokens: tokens,
              vaults: tokens[0].chainId === vault.chainId ? [vault] : [],
            })
          )
        )
      );
    }

    return {
      options: options,
    };
  },
  {
    condition({ mode }, { getState }) {
      const state = getState();

      return (
        selectTransactOptionsMode(state) !== mode ||
        selectTransactVaultId(state) !== selectTransactOptionsVaultId(state)
      );
    },
  }
);

function getUniqueTokensForOptions(options: TransactOption[], _state: BeefyState): TokenEntity[] {
  const tokens = options.flatMap(option => {
    return option.mode === TransactMode.Deposit ? option.inputs : option.wantedOutputs;
  });

  return uniqueTokens(tokens);
}

export type TransactFetchQuotesPayload = {
  selectionId: string;
  chainId: ChainEntity['id'];
  inputAmounts: InputTokenAmount[];
  quotes: TransactQuote[];
};

export const transactFetchQuotes = createAsyncThunk<
  TransactFetchQuotesPayload,
  void,
  { state: BeefyState }
>('transact/fetchQuotes', async (_, { getState, dispatch }) => {
  console.log('fetchQuotes started');
  const api = await getTransactApi();
  const state = getState();
  const mode = selectTransactOptionsMode(state);
  const inputAmount = selectTransactInputAmount(state);
  const inputMax = selectTransactInputMax(state);
  const dualInputAmounts = selectTransactDualInputAmounts(state);
  const dualMaxAmounts = selectTransactDualMaxAmounts;
  const walletAddress = selectWalletAddress(state);

  const vaultId = selectTransactVaultId(state);
  const vault = selectVaultById(state, vaultId);
  // This can be improved, don't worry chimpo

  if (vault.type !== 'cowcentrated' && inputAmount.lte(BIG_ZERO)) {
    throw new Error(`Can not quote for 0`);
  }
  if (vault.type === 'cowcentrated' && dualInputAmounts.every(amount => amount.lte(BIG_ZERO))) {
    throw new Error(`Can not quote for [0, 0]`);
  }

  const selectionId = selectTransactSelectedSelectionId(state);
  if (!selectionId) {
    throw new Error(`No selectionId selected`);
  }

  const chainId = selectTransactSelectedChainId(state);
  if (!chainId) {
    throw new Error(`No chainId selected`);
  }

  const options = selectTransactOptionsForSelectionId(state, selectionId);
  if (!options || options.length === 0) {
    throw new Error(`No options for selectionId ${selectionId}`);
  }

  const selection = selectTransactSelectionById(state, selectionId);
  if (!selection || selection.tokens.length === 0) {
    throw new Error(`No tokens for selectionId ${selectionId}`);
  }

  // const vaultId = selectTransactVaultId(state);
  // const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  // TODO handle differently for univ3 with multiple deposit tokens
  const inputAmounts: InputTokenAmount[] =
    vault.type !== 'cowcentrated' || mode === TransactMode.Withdraw
      ? [
          {
            amount: inputAmount,
            token: mode === TransactMode.Withdraw ? depositToken : selection.tokens[0], // for withdraw this is always depositToken / deposit is only token of selection
            max: inputMax,
          },
        ]
      : [
          {
            amount: dualInputAmounts[0],
            token: selection.tokens[0],
            max: dualMaxAmounts[0],
          },
          {
            amount: dualInputAmounts[1],
            token: selection.tokens[1],
            max: dualMaxAmounts[1],
          },
        ];

  let quotes: TransactQuote[];
  if (options.every(isDepositOption)) {
    console.log('every option is a deposit option');
    quotes = await api.fetchDepositQuotesFor(options, inputAmounts, getState);
  } else if (options.every(isWithdrawOption)) {
    quotes = await api.fetchWithdrawQuotesFor(options, inputAmounts, getState);
  } else {
    throw new Error(`Invalid options`);
  }

  quotes.sort((a, b) => {
    const valueA = selectTokenAmountsTotalValue(state, a.outputs);
    const valueB = selectTokenAmountsTotalValue(state, b.outputs);
    return valueB.comparedTo(valueA);
  });

  // update allowances
  if (walletAddress) {
    const uniqueAllowances = uniqBy(
      quotes.map(quote => quote.allowances).flat(),
      allowance =>
        `${allowance.token.chainId}-${allowance.spenderAddress}-${allowance.token.address}`
    );
    const allowancesPerChainSpender = groupBy(
      uniqueAllowances,
      allowance => `${allowance.token.chainId}-${allowance.spenderAddress}`
    );

    await Promise.all(
      Object.values(allowancesPerChainSpender).map(allowances =>
        dispatch(
          fetchAllowanceAction({
            chainId: allowances[0].token.chainId,
            spenderAddress: allowances[0].spenderAddress,
            tokens: allowances.map(allowance => allowance.token),
            walletAddress,
          })
        )
      )
    );
  }

  return {
    selectionId,
    chainId,
    inputAmounts,
    quotes,
  };
});

export const transactFetchQuotesIfNeeded = createAsyncThunk<void, void, { state: BeefyState }>(
  'transact/fetchQuotesIfNeeded',
  async (_, { getState, dispatch }) => {
    console.log('fetchQuotesIfNeeded started');
    const state = getState();
    const quote = selectTransactSelectedQuoteOrUndefined(state);
    let shouldFetch = true;

    console.log('fetchQuotesIfNeeded', quote);

    if (quote) {
      const option = quote.option;
      const vaultId = selectTransactVaultId(state);
      const chainId = selectTransactSelectedChainId(state);
      const selectionId = selectTransactSelectedSelectionId(state);
      const inputAmount = selectTransactInputAmount(state);
      const input = onlyOneInput(quote.inputs);

      shouldFetch =
        option.chainId !== chainId ||
        option.vaultId !== vaultId ||
        option.selectionId !== selectionId ||
        !input.amount.eq(inputAmount);
    }

    if (shouldFetch) {
      dispatch(transactFetchQuotes());
    }
  }
);

/**
 * Steps to deposit into or withdraw from a vault
 * Builds allowance steps from quote data,
 * then asks quote provider for the deposit/withdraw step,
 * which is wrapped to provide quote recheck/confirm functionality
 */
export function transactSteps(
  quote: TransactQuote,
  t: TFunction<Namespace>
): ThunkAction<void, BeefyState, void, Action> {
  return async function (dispatch, getState) {
    const steps: Step[] = [];
    const state = getState();
    const api = await getTransactApi();

    for (const allowanceTokenAmount of quote.allowances) {
      if (isTokenErc20(allowanceTokenAmount.token)) {
        const allowance = selectAllowanceByTokenAddress(
          state,
          allowanceTokenAmount.token.chainId,
          allowanceTokenAmount.token.address,
          allowanceTokenAmount.spenderAddress
        );

        if (allowance.lt(allowanceTokenAmount.amount)) {
          steps.push({
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(
              allowanceTokenAmount.token,
              allowanceTokenAmount.spenderAddress
            ),
            pending: false,
          });
        }
      }
    }

    let originalStep: Step;
    if (isDepositQuote(quote)) {
      originalStep = await api.fetchDepositStep(quote, getState, t);
    } else if (isWithdrawQuote(quote)) {
      originalStep = await api.fetchWithdrawStep(quote, getState, t);
    } else {
      throw new Error(`Invalid quote`);
    }

    steps.push(wrapStepConfirmQuote(originalStep, quote));

    dispatch(startStepperWithSteps(steps, quote.inputs[0].token.chainId));
  };
}

/**
 * Special steps builder for gov (earnings) vault claim button
 */
export function transactStepsClaimGov(
  vault: VaultGov,
  t: TFunction<Namespace>
): ThunkAction<void, BeefyState, void, Action> {
  return async function (dispatch, _getState) {
    dispatch(
      startStepperWithSteps(
        [
          {
            step: 'claim-gov',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: walletActions.claimGovVault(vault),
            pending: false,
          },
        ],
        vault.chainId
      )
    );
  };
}

/**
 * Wraps a step action in order to confirm the quote is still valid before performing the TX
 * Needed as we (may) have allowance TXs to perform first
 */
function wrapStepConfirmQuote(originalStep: Step, originalQuote: TransactQuote): Step {
  const action: BeefyThunk = async function (dispatch, getState) {
    const requestId = nanoid();
    dispatch(transactActions.confirmPending({ requestId }));

    try {
      const api = await getTransactApi();
      const option = originalQuote.option;
      let quotes: TransactQuote[];
      if (isDepositOption(option)) {
        quotes = await api.fetchDepositQuotesFor([option], originalQuote.inputs, getState);
      } else if (isWithdrawOption(option)) {
        quotes = await api.fetchWithdrawQuotesFor([option], originalQuote.inputs, getState);
      } else {
        throw new Error(`Invalid option`);
      }

      const state = getState();
      const maxSlippage = selectTransactSlippage(state);
      const newQuote = quotes.find(quote => quote.option.id === originalQuote.option.id);
      const minAllowedRatio = new BigNumber(1 - maxSlippage * 0.1); // max 10% of slippage lower
      console.log('minAllowedRatio', minAllowedRatio.toString(10));

      if (!newQuote) {
        throw new Error(`Failed to get new quote.`);
      }

      const significantChanges: QuoteOutputTokenAmountChange[] = [];
      for (const originalOutput of originalQuote.outputs) {
        const newOutput = newQuote.outputs.find(output =>
          isTokenEqual(originalOutput.token, output.token)
        );

        if (
          !newOutput ||
          newOutput.amount.lt(originalOutput.amount.multipliedBy(minAllowedRatio))
        ) {
          const newAmount = newOutput ? newOutput.amount : BIG_ZERO;
          significantChanges.push({
            ...originalOutput,
            newAmount,
            difference: newAmount.minus(originalOutput.amount),
          });
        }
      }

      // Perform original action if no changes
      if (significantChanges.length === 0) {
        dispatch(
          transactActions.confirmUnneeded({
            requestId,
            newQuote,
            originalQuoteId: originalQuote.id,
          })
        );
        return await originalStep.action(dispatch, getState, undefined);
      }

      console.debug('original', originalQuote);
      console.debug('new', newQuote);
      console.debug(
        'changes',
        significantChanges
          .map(change => `${change.difference.toString(10)} ${change.token.symbol}`)
          .join(',\n')
      );

      // Hide stepper (as UI will now show confirm notice)
      dispatch(stepperActions.reset());
      dispatch(
        transactActions.confirmNeeded({
          requestId,
          changes: significantChanges,
          newQuote,
          originalQuoteId: originalQuote.id,
        })
      );
    } catch (error) {
      // Hide stepper (as UI will now show error)
      dispatch(stepperActions.reset());
      dispatch(transactActions.confirmRejected({ requestId, error: miniSerializeError(error) }));
      return;
    }
  };

  return {
    ...originalStep,
    action,
  };
}
