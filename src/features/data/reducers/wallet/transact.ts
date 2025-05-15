import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { first } from 'lodash-es';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import {
  transactClearInput,
  transactClearQuotes,
  transactConfirmNeeded,
  transactConfirmPending,
  transactConfirmRejected,
  transactConfirmUnneeded,
  transactFetchOptions,
  transactFetchQuotes,
  transactInit,
  transactInitReady,
  transactSelectQuote,
  transactSelectSelection,
  transactSetInputAmount,
  transactSetSlippage,
  transactSwitchMode,
  transactSwitchStep,
} from '../../actions/transact.ts';
import { type TransactOption, type TransactQuote } from '../../apis/transact/transact-types.ts';
import type {
  TransactOptions,
  TransactQuotes,
  TransactSelections,
  TransactState,
} from './transact-types.ts';
import { TransactMode, TransactStatus, TransactStep } from './transact-types.ts';

const initialTransactTokens: TransactSelections = {
  allSelectionIds: [],
  bySelectionId: {},
  allChainIds: [],
  byChainId: {},
};

const initialTransactOptions: TransactOptions = {
  vaultId: undefined,
  mode: TransactMode.Deposit,
  status: TransactStatus.Idle,
  requestId: undefined,
  error: undefined,
  allOptionIds: [],
  byOptionId: {},
  bySelectionId: {},
};

const initialTransactQuotes: TransactQuotes = {
  allQuoteIds: [],
  byQuoteId: {},
  status: TransactStatus.Idle,
  requestId: undefined,
  error: undefined,
};

const initialTransactConfirm = {
  changes: [],
  status: TransactStatus.Idle,
  requestId: undefined,
  error: undefined,
};

const initialTransactState: TransactState = {
  vaultId: undefined,
  pendingVaultId: undefined,
  selectedChainId: undefined,
  selectedSelectionId: undefined,
  selectedQuoteId: undefined,
  swapSlippage: 0.01, // 1% default
  inputAmounts: [BIG_ZERO],
  inputMaxes: [false],
  mode: TransactMode.Deposit,
  step: TransactStep.Form,
  selections: initialTransactTokens,
  forceSelection: false,
  options: initialTransactOptions,
  quotes: initialTransactQuotes,
  confirm: initialTransactConfirm,
};

const transactSlice = createSlice({
  name: 'transact',
  initialState: initialTransactState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(transactSwitchMode, (sliceState, action) => {
        sliceState.mode = action.payload;
        sliceState.step = TransactStep.Form;
        sliceState.inputAmounts = [BIG_ZERO];
        sliceState.inputMaxes = [false];
      })
      .addCase(transactSwitchStep, (sliceState, action) => {
        sliceState.step = action.payload;
      })
      .addCase(transactSelectSelection, (sliceState, action) => {
        sliceState.selectedSelectionId = action.payload.selectionId;
        sliceState.step = TransactStep.Form;
        sliceState.forceSelection = false;
        if (action.payload.resetInput) {
          clearInputs(sliceState);
        }
      })
      .addCase(transactSetInputAmount, (sliceState, action) => {
        const { index, amount, max } = action.payload;
        if (!sliceState.inputAmounts[index] || !sliceState.inputAmounts[index].isEqualTo(amount)) {
          sliceState.inputAmounts[index] = amount;
        }
        if (!sliceState.inputMaxes[index] || sliceState.inputMaxes[index] !== max) {
          sliceState.inputMaxes[index] = max;
        }
      })
      .addCase(transactClearInput, sliceState => {
        clearInputs(sliceState);
        resetQuotes(sliceState);
      })
      .addCase(transactClearQuotes, sliceState => {
        resetQuotes(sliceState);
      })
      .addCase(transactConfirmPending, (sliceState, action) => {
        resetConfirm(sliceState);
        sliceState.confirm.status = TransactStatus.Pending;
        sliceState.confirm.requestId = action.payload.requestId;
      })
      .addCase(transactConfirmRejected, (sliceState, action) => {
        if (sliceState.confirm.requestId === action.payload.requestId) {
          sliceState.confirm.status = TransactStatus.Rejected;
          sliceState.confirm.error = action.payload.error;
        }
      })
      .addCase(transactConfirmNeeded, (sliceState, action) => {
        if (sliceState.confirm.requestId === action.payload.requestId) {
          sliceState.confirm.status = TransactStatus.Fulfilled;
          sliceState.confirm.changes = action.payload.changes;
          // replace quote
          delete sliceState.quotes.byQuoteId[action.payload.originalQuoteId];
          sliceState.quotes.byQuoteId[action.payload.newQuote.id] = action.payload.newQuote;
          sliceState.quotes.allQuoteIds = Object.keys(sliceState.quotes.byQuoteId);
          sliceState.selectedQuoteId = action.payload.newQuote.id;
        }
      })
      .addCase(transactConfirmUnneeded, (sliceState, action) => {
        if (sliceState.confirm.requestId === action.payload.requestId) {
          sliceState.confirm.status = TransactStatus.Fulfilled;
          sliceState.confirm.changes = [];
          // replace quote
          delete sliceState.quotes.byQuoteId[action.payload.originalQuoteId];
          sliceState.quotes.byQuoteId[action.payload.newQuote.id] = action.payload.newQuote;
          sliceState.quotes.allQuoteIds = Object.keys(sliceState.quotes.byQuoteId);
          sliceState.selectedQuoteId = action.payload.newQuote.id;
        }
      })
      .addCase(transactSelectQuote, (sliceState, action) => {
        sliceState.selectedQuoteId = action.payload.quoteId;
        sliceState.step = TransactStep.Form;
      })
      .addCase(transactSetSlippage, (sliceState, action) => {
        sliceState.swapSlippage = action.payload.slippage;
      })
      .addCase(transactInit, (sliceState, action) => {
        const isReady = sliceState.vaultId === action.payload.vaultId;
        const isPending = sliceState.pendingVaultId === action.payload.vaultId;

        resetForm(sliceState);

        if (isReady) {
          return;
        }

        if (!isPending) {
          sliceState.vaultId = undefined;
          sliceState.pendingVaultId = action.payload.vaultId;
          sliceState.step = TransactStep.Loading;
          sliceState.mode = TransactMode.Deposit;
          sliceState.options = initialTransactState['options'];
        }
      })
      .addCase(transactInitReady, (sliceState, action) => {
        if (sliceState.pendingVaultId === action.payload.vaultId) {
          sliceState.vaultId = action.payload.vaultId;
          sliceState.pendingVaultId = undefined;
          sliceState.step = TransactStep.Form;
          sliceState.mode = TransactMode.Deposit;
        }
      })
      .addCase(transactFetchOptions.pending, (sliceState, action) => {
        resetForm(sliceState);

        sliceState.options.vaultId = action.meta.arg.vaultId;
        sliceState.options.mode = action.meta.arg.mode;
        sliceState.options.requestId = action.meta.requestId;
      })
      .addCase(transactFetchOptions.rejected, (sliceState, action) => {
        if (sliceState.options.requestId === action.meta.requestId) {
          sliceState.options.status = TransactStatus.Rejected;
          sliceState.options.error = action.error;
          console.error(action.error);
        }
      })
      .addCase(transactFetchOptions.fulfilled, (sliceState, action) => {
        if (sliceState.options.requestId === action.meta.requestId) {
          sliceState.options.status = TransactStatus.Fulfilled;
          const { options } = action.payload;

          addOptionsToState(sliceState, options);

          const defaultOption = first(options);
          if (defaultOption) {
            sliceState.selectedSelectionId = defaultOption.selectionId;
            sliceState.selectedChainId = defaultOption.chainId;
            sliceState.forceSelection = options.length > 1;
          }
          clearInputs(sliceState);
        }
      })
      .addCase(transactFetchQuotes.pending, (sliceState, action) => {
        resetQuotes(sliceState);
        sliceState.quotes.status = TransactStatus.Pending;
        sliceState.quotes.requestId = action.meta.requestId;
      })
      .addCase(transactFetchQuotes.rejected, (sliceState, action) => {
        if (sliceState.quotes.requestId === action.meta.requestId) {
          sliceState.quotes.status = TransactStatus.Rejected;
          sliceState.quotes.error = action.meta.rejectedWithValue ? action.payload : action.error;
          console.error(sliceState.quotes.error);
        }
      })
      .addCase(transactFetchQuotes.fulfilled, (sliceState, action) => {
        if (sliceState.quotes.requestId === action.meta.requestId) {
          sliceState.quotes.status = TransactStatus.Fulfilled;

          addQuotesToState(sliceState, action.payload.quotes);

          if (sliceState.selectedQuoteId === undefined) {
            const firstQuote = first(action.payload.quotes);
            if (firstQuote) {
              sliceState.selectedQuoteId = firstQuote.id;
            }
          }
        }
      });
  },
});

function clearInputs(sliceState: Draft<TransactState>) {
  const selection =
    sliceState.selectedSelectionId ?
      sliceState.selections.bySelectionId[sliceState.selectedSelectionId]
    : undefined;
  if (selection) {
    sliceState.inputAmounts = selection.tokens.map(() => BIG_ZERO);
    sliceState.inputMaxes = selection.tokens.map(() => false);
  } else {
    sliceState.inputAmounts = [BIG_ZERO];
    sliceState.inputMaxes = [false];
  }
}

function resetForm(sliceState: Draft<TransactState>) {
  sliceState.selectedChainId = undefined;
  sliceState.selectedSelectionId = undefined;
  sliceState.inputAmounts = [BIG_ZERO];
  sliceState.inputMaxes = [false];
  sliceState.forceSelection = false;

  sliceState.options.status = TransactStatus.Idle;
  sliceState.options.error = undefined;
  sliceState.options.allOptionIds = [];
  sliceState.options.byOptionId = {};
  sliceState.options.bySelectionId = {};

  sliceState.selections.allSelectionIds = [];
  sliceState.selections.allChainIds = [];
  sliceState.selections.bySelectionId = {};
  sliceState.selections.byChainId = {};

  resetQuotes(sliceState);
}

function resetQuotes(sliceState: Draft<TransactState>) {
  sliceState.selectedQuoteId = undefined;
  sliceState.quotes.status = TransactStatus.Idle;
  sliceState.quotes.allQuoteIds = [];
  sliceState.quotes.byQuoteId = {};
  sliceState.quotes.error = undefined;
  sliceState.quotes.requestId = undefined;

  resetConfirm(sliceState);
}

function resetConfirm(sliceState: Draft<TransactState>) {
  sliceState.confirm.requestId = undefined;
  sliceState.confirm.error = undefined;
  sliceState.confirm.status = TransactStatus.Idle;
  sliceState.confirm.changes = [];
}

function addQuotesToState(sliceState: Draft<TransactState>, quotes: TransactQuote[]) {
  for (const quote of quotes) {
    if (quote.id in sliceState.quotes.byQuoteId) {
      console.warn(`Attempting to add duplicate quote id ${quote.id} to state`);
      continue;
    }

    sliceState.quotes.byQuoteId[quote.id] = quote;
    sliceState.quotes.allQuoteIds.push(quote.id);
  }
}

function addOptionsToState(sliceState: Draft<TransactState>, options: TransactOption[]) {
  for (const option of options) {
    if (option.id in sliceState.options.byOptionId) {
      console.warn(`Attempting to add duplicate option id ${option.id} to state`);
      continue;
    }

    // Add optionId => option mapping
    sliceState.options.byOptionId[option.id] = option;
    sliceState.options.allOptionIds.push(option.id);

    // Add selectionId -> optionId[] mapping
    if (!(option.selectionId in sliceState.options.bySelectionId)) {
      sliceState.options.bySelectionId[option.selectionId] = [option.id];
    } else {
      sliceState.options.bySelectionId[option.selectionId].push(option.id);
    }

    // Add selectionId -> address[] mapping
    const existingSelection = sliceState.selections.bySelectionId[option.selectionId];
    if (!existingSelection) {
      sliceState.selections.bySelectionId[option.selectionId] = {
        id: option.selectionId,
        tokens: option.mode === TransactMode.Deposit ? option.inputs : option.wantedOutputs,
        order: option.selectionOrder,
        hideIfZeroBalance: !!option.selectionHideIfZeroBalance,
      };

      sliceState.selections.allSelectionIds.push(option.selectionId);
    } else if (existingSelection.hideIfZeroBalance === true && !option.selectionHideIfZeroBalance) {
      // Only hide if all options for this selection have it enabled
      existingSelection.hideIfZeroBalance = false;
    }

    // Add chainId -> selectionId[] mapping
    const byChainId = sliceState.selections.byChainId[option.chainId];
    if (!byChainId) {
      sliceState.selections.byChainId[option.chainId] = [option.selectionId];
      sliceState.selections.allChainIds.push(option.chainId);
    } else if (!byChainId.includes(option.selectionId)) {
      byChainId.push(option.selectionId);
    }
  }
}

export const transactReducer = transactSlice.reducer;
