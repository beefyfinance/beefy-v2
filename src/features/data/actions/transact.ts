import { createAction } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { groupBy, uniqBy } from 'lodash-es';
import { BIG_ZERO, compareBigNumber } from '../../../helpers/big-number.ts';
import { uniqueTokens } from '../../../helpers/tokens.ts';
import { getTransactApi } from '../apis/instances.ts';
import type { SerializedError } from '../apis/transact/strategies/error-types.ts';
import { isSerializableError } from '../apis/transact/strategies/error.ts';
import type {
  InputTokenAmount,
  ITransactApi,
  QuoteOutputTokenAmountChange,
  TransactOption,
  TransactQuote,
} from '../apis/transact/transact-types.ts';
import { isDepositOption, isWithdrawOption } from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import { isCowcentratedVault, type VaultEntity } from '../entities/vault.ts';
import {
  TransactMode,
  TransactStatus,
  type TransactStep,
} from '../reducers/wallet/transact-types.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
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
  selectTransactVaultId,
} from '../selectors/transact.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { fetchAllowanceAction } from './allowance.ts';
import { fetchBalanceAction } from './balance.ts';

export type TransactInitArgs = {
  vaultId: VaultEntity['id'];
};

export const transactInit = createAction<TransactInitArgs>('transact/init');
export const transactInitReady = createAction<TransactInitArgs>('transact/init/ready');
export const transactSwitchMode = createAction<TransactMode>('transact/switchMode');
export const transactSwitchStep = createAction<TransactStep>('transact/switchStep');
export const transactSelectSelection = createAction<{
  selectionId: string;
  resetInput: boolean;
}>('transact/selectSelection');
export const transactSetInputAmount = createAction<{
  index: number;
  amount: BigNumber;
  max: boolean;
}>('transact/setInputAmount');
export const transactClearInput = createAction('transact/clearInput');
export const transactClearQuotes = createAction('transact/clearQuotes');
export const transactConfirmPending = createAction<{
  requestId: string;
}>('transact/confirmPending');
export const transactConfirmRejected = createAction<{
  requestId: string;
  error: SerializedError;
}>('transact/confirmRejected');
export const transactConfirmNeeded = createAction<{
  requestId: string;
  changes: QuoteOutputTokenAmountChange[];
  newQuote: TransactQuote;
  originalQuoteId: TransactQuote['id'];
}>('transact/confirmNeeded');
export const transactConfirmUnneeded = createAction<{
  requestId: string;
  newQuote: TransactQuote;
  originalQuoteId: TransactQuote['id'];
}>('transact/confirmUnneeded');
export const transactSelectQuote = createAction<{
  quoteId: string;
}>('transact/selectQuote');
export const transactSetSlippage = createAction<{
  slippage: number;
}>('transact/setSlippage');

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

export const transactFetchOptions = createAppAsyncThunk<
  TransactFetchOptionsPayload,
  TransactFetchOptionsArgs
>(
  'transact/fetchOptions',
  async ({ vaultId, mode }, { getState, dispatch }) => {
    if (mode === TransactMode.Claim || mode === TransactMode.Boost) {
      throw new Error(`Claim or Boost mode not supported.`);
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

export const transactFetchQuotes = createAppAsyncThunk<
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
      return compareBigNumber(valueB, valueA);
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

export const transactFetchQuotesIfNeeded = createAppAsyncThunk(
  'transact/fetchQuotesIfNeeded',
  async (_, { getState, dispatch }) => {
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
  }
);
