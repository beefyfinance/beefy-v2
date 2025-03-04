import { createAction, createAsyncThunk, nanoid, type ThunkAction } from '@reduxjs/toolkit';
import type { BeefyState, BeefyStateFn, BeefyThunk } from '../../../redux-types.ts';
import { isCowcentratedVault, type VaultEntity, type VaultGov } from '../entities/vault.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { getTransactApi } from '../apis/instances.ts';
import { transactActions } from '../reducers/wallet/transact.ts';
import {
  selectTokenAmountsTotalValue,
  selectTransactInputAmounts,
  selectTransactInputMaxes,
  selectTransactOptionsForSelectionId,
  selectTransactOptionsMode,
  selectTransactOptionsVaultId,
  selectTransactQuoteStatus,
  selectTransactSelectedChainId,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactSelectedSelectionId,
  selectTransactSelectionById,
  selectTransactSlippage,
  selectTransactVaultId,
} from '../selectors/transact.ts';
import type {
  InputTokenAmount,
  ITransactApi,
  QuoteOutputTokenAmountChange,
  TransactOption,
  TransactQuote,
} from '../apis/transact/transact-types.ts';
import {
  isDepositOption,
  isDepositQuote,
  isWithdrawOption,
  isWithdrawQuote,
} from '../apis/transact/transact-types.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import { isTokenEqual, isTokenErc20 } from '../entities/token.ts';
import { BigNumber } from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../reducers/wallet/stepper.ts';
import { stepperActions } from '../reducers/wallet/stepper.ts';
import { selectAllowanceByTokenAddress } from '../selectors/allowances.ts';
import { walletActions } from './wallet-actions.ts';
import { startStepperWithSteps } from './stepper.ts';
import { TransactMode, TransactStatus } from '../reducers/wallet/transact-types.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
import { groupBy, uniqBy } from 'lodash-es';
import { fetchAllowanceAction } from './allowance.ts';
import { uniqueTokens } from '../../../helpers/tokens.ts';
import { fetchBalanceAction } from './balance.ts';
import type { Action } from 'redux';
import { selectWalletAddress } from '../selectors/wallet.ts';
import { isSerializableError, serializeError } from '../apis/transact/strategies/error.ts';
import type { SerializedError } from '../apis/transact/strategies/error-types.ts';

export type TransactInitArgs = {
  vaultId: VaultEntity['id'];
};

export const transactInit = createAction<TransactInitArgs>('transact/init');
export const transactInitReady = createAction<TransactInitArgs>('transact/init/ready');

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
} as const satisfies Partial<Record<TransactMode, keyof ITransactApi>>;

export const transactFetchOptions = createAsyncThunk<
  TransactFetchOptionsPayload,
  TransactFetchOptionsArgs,
  {
    state: BeefyState;
  }
>(
  'transact/fetchOptions',
  async ({ vaultId, mode }, { getState, dispatch }) => {
    if (mode === TransactMode.Claim) {
      throw new Error(`Claim mode not supported.`);
    }

    const api = await getTransactApi();
    const state = getState();
    const method = optionsForByMode[mode];
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
      if (!(mode in optionsForByMode)) {
        return false;
      }

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
  {
    state: BeefyState;
    rejectValue: SerializedError;
  }
>('transact/fetchQuotes', async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const api = await getTransactApi();
    const state = getState();
    const mode = selectTransactOptionsMode(state);
    const inputAmounts = selectTransactInputAmounts(state);
    const inputMaxes = selectTransactInputMaxes(state);
    const walletAddress = selectWalletAddress(state);
    const vaultId = selectTransactVaultId(state);
    const vault = selectVaultById(state, vaultId);

    if (inputAmounts.every(amount => amount.lte(BIG_ZERO))) {
      throw new Error(`Can not quote for 0`);
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

    const quoteInputAmounts: InputTokenAmount[] = [];
    if (mode === TransactMode.Deposit) {
      // For deposit, user enters number of the selected token(s) to deposit
      selection.tokens.forEach((token, index) => {
        quoteInputAmounts.push({
          token,
          amount: inputAmounts[index] || BIG_ZERO,
          max: inputMaxes[index] || false,
        });
      });
    } else {
      let inputToken: TokenEntity;
      if (isCowcentratedVault(vault)) {
        // For CLM vaults, user enters number of shares to withdraw
        inputToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
      } else {
        // For standard/gov vaults, user enters number of deposit token to withdraw
        inputToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
      }
      quoteInputAmounts.push({
        token: inputToken,
        amount: inputAmounts[0] || BIG_ZERO,
        max: inputMaxes[0] || false,
      });
    }

    let quotes: TransactQuote[];
    if (options.every(isDepositOption)) {
      quotes = await api.fetchDepositQuotesFor(options, quoteInputAmounts, getState);
    } else if (options.every(isWithdrawOption)) {
      quotes = await api.fetchWithdrawQuotesFor(options, quoteInputAmounts, getState);
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

    if (quotes.length === 0) {
      throw new Error(`No quotes available`);
    }

    return {
      selectionId,
      chainId,
      inputAmounts: quoteInputAmounts,
      quotes,
    };
  } catch (e: unknown) {
    if (isSerializableError(e)) {
      return rejectWithValue(e.serialize());
    }
    throw e;
  }
});

export const transactFetchQuotesIfNeeded = createAsyncThunk<
  void,
  void,
  {
    state: BeefyState;
  }
>('transact/fetchQuotesIfNeeded', async (_, { getState, dispatch }) => {
  const state = getState();
  const quote = selectTransactSelectedQuoteOrUndefined(state);
  let shouldFetch = selectTransactQuoteStatus(state) !== TransactStatus.Fulfilled;

  if (quote) {
    const option = quote.option;
    const vaultId = selectTransactVaultId(state);
    const chainId = selectTransactSelectedChainId(state);
    const selectionId = selectTransactSelectedSelectionId(state);
    const inputAmounts = selectTransactInputAmounts(state);
    const matchingInputs =
      inputAmounts.length === quote.inputs.length &&
      inputAmounts.every((amount, index) => amount.eq(quote.inputs[index].amount));

    shouldFetch =
      option.chainId !== chainId ||
      option.vaultId !== vaultId ||
      option.selectionId !== selectionId ||
      !matchingInputs;
  }

  if (shouldFetch) {
    dispatch(transactFetchQuotes());
  }
});

export async function getTransactSteps(
  quote: TransactQuote,
  t: TFunction<Namespace>,
  getState: BeefyStateFn
): Promise<Step[]> {
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
            allowanceTokenAmount.spenderAddress,
            allowanceTokenAmount.amount
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

  return steps;
}

/**
 * Steps to deposit into or withdraw from a vault
 * Builds allowance steps from quote data,
 * then asks quote provider for the deposit/withdraw step,
 * which is wrapped to provide quote recheck/confirm functionality
 */
export function transactSteps(
  quote: TransactQuote,
  t: TFunction<Namespace>
): ThunkAction<Promise<void>, BeefyState, void, Action> {
  return async function (dispatch, getState) {
    const steps = await getTransactSteps(quote, t, getState);
    dispatch(startStepperWithSteps(steps, quote.inputs[0].token.chainId));
  };
}

/**
 * Special steps builder for gov (earnings) vault claim button
 */
export function transactStepsClaimGov(
  vault: VaultGov,
  t: TFunction<Namespace>
): ThunkAction<Promise<void>, BeefyState, void, Action> {
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
      dispatch(transactActions.confirmRejected({ requestId, error: serializeError(error) }));
      return;
    }
  };

  return {
    ...originalStep,
    action,
  };
}
