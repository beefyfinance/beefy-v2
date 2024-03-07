import type { BigNumber } from 'bignumber.js';
import { first } from 'lodash-es';
import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { transactFetchOptions, transactFetchQuotes, transactInit } from '../../actions/transact';
import type {
  QuoteOutputTokenAmountChange,
  TransactOption,
  TransactQuote,
} from '../../apis/transact/transact-types';
import type { Draft } from 'immer';
import { BIG_ZERO } from '../../../../helpers/big-number';
import type {
  TransactOptions,
  TransactQuotes,
  TransactSelections,
  TransactState,
} from './transact-types';
import { TransactMode, TransactStatus, TransactStep } from './transact-types';

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
  selectedChainId: undefined,
  selectedSelectionId: undefined,
  selectedQuoteId: undefined,
  swapSlippage: 0.01, // 1% default
  inputAmount: BIG_ZERO,
  inputMax: false,
  dualInputAmounts: [BIG_ZERO, BIG_ZERO],
  dualInputMax: [false, false],
  mode: TransactMode.Deposit,
  step: TransactStep.Form,
  selections: initialTransactTokens,
  options: initialTransactOptions,
  quotes: initialTransactQuotes,
  migrateQuotes: initialTransactQuotes,
  confirm: initialTransactConfirm,
};

const transactSlice = createSlice({
  name: 'transact',
  initialState: initialTransactState,
  reducers: {
    switchMode(sliceState, action: PayloadAction<TransactMode>) {
      sliceState.mode = action.payload;
      sliceState.step = TransactStep.Form;
      sliceState.inputAmount = BIG_ZERO;
      sliceState.dualInputAmounts = [BIG_ZERO, BIG_ZERO];
    },
    switchStep(sliceState, action: PayloadAction<TransactStep>) {
      sliceState.step = action.payload;
    },
    selectSelection(
      sliceState,
      action: PayloadAction<{ selectionId: string; resetInput: boolean }>
    ) {
      sliceState.selectedSelectionId = action.payload.selectionId;
      sliceState.step = TransactStep.Form;
      if (action.payload.resetInput) {
        sliceState.inputAmount = BIG_ZERO;
        sliceState.inputMax = false;
        sliceState.dualInputAmounts = [BIG_ZERO, BIG_ZERO];
        sliceState.dualInputMax = [false, false];
      }
    },
    setInputAmount(sliceState, action: PayloadAction<{ amount: BigNumber; max: boolean }>) {
      if (!sliceState.inputAmount.isEqualTo(action.payload.amount)) {
        sliceState.inputAmount = action.payload.amount;
      }
      if (sliceState.inputMax !== action.payload.max) {
        sliceState.inputMax = action.payload.max;
      }
    },
    setDualInputAmount(
      sliceState,
      action: PayloadAction<{ index: number; amount: BigNumber; max: boolean }>
    ) {
      if (!sliceState.dualInputAmounts[action.payload.index].isEqualTo(action.payload.amount)) {
        sliceState.dualInputAmounts[action.payload.index] = action.payload.amount;
      }
      if (sliceState.dualInputMax[action.payload.index] !== action.payload.max) {
        sliceState.dualInputMax[action.payload.index] = action.payload.max;
      }
    },
    clearInput(sliceState) {
      sliceState.inputAmount = BIG_ZERO;
      sliceState.inputMax = false;
      sliceState.dualInputAmounts = [BIG_ZERO, BIG_ZERO];
      sliceState.dualInputMax = [false, false];
      resetQuotes(sliceState);
    },
    clearQuotes(sliceState) {
      console.log('clearing quotes');
      resetQuotes(sliceState);
    },
    confirmPending(sliceState, action: PayloadAction<{ requestId: string }>) {
      resetConfirm(sliceState);
      sliceState.confirm.status = TransactStatus.Pending;
      sliceState.confirm.requestId = action.payload.requestId;
    },
    confirmRejected(
      sliceState,
      action: PayloadAction<{ requestId: string; error: SerializedError }>
    ) {
      if (sliceState.confirm.requestId === action.payload.requestId) {
        sliceState.confirm.status = TransactStatus.Rejected;
        sliceState.confirm.error = action.payload.error;
      }
    },
    confirmNeeded(
      sliceState,
      action: PayloadAction<{
        requestId: string;
        changes: QuoteOutputTokenAmountChange[];
        newQuote: TransactQuote;
        originalQuoteId: TransactQuote['id'];
      }>
    ) {
      if (sliceState.confirm.requestId === action.payload.requestId) {
        sliceState.confirm.status = TransactStatus.Fulfilled;
        sliceState.confirm.changes = action.payload.changes;
        // replace quote
        delete sliceState.quotes.byQuoteId[action.payload.originalQuoteId];
        sliceState.quotes.byQuoteId[action.payload.newQuote.id] = action.payload.newQuote;
        sliceState.quotes.allQuoteIds = Object.keys(sliceState.quotes.byQuoteId);
        sliceState.selectedQuoteId = action.payload.newQuote.id;
      }
    },
    confirmUnneeded(
      sliceState,
      action: PayloadAction<{
        requestId: string;
        newQuote: TransactQuote;
        originalQuoteId: TransactQuote['id'];
      }>
    ) {
      if (sliceState.confirm.requestId === action.payload.requestId) {
        sliceState.confirm.status = TransactStatus.Fulfilled;
        sliceState.confirm.changes = [];
        // replace quote
        delete sliceState.quotes.byQuoteId[action.payload.originalQuoteId];
        sliceState.quotes.byQuoteId[action.payload.newQuote.id] = action.payload.newQuote;
        sliceState.quotes.allQuoteIds = Object.keys(sliceState.quotes.byQuoteId);
        sliceState.selectedQuoteId = action.payload.newQuote.id;
      }
    },
    selectQuote(sliceState, action: PayloadAction<{ quoteId: string }>) {
      sliceState.selectedQuoteId = action.payload.quoteId;
      sliceState.step = TransactStep.Form;
    },
    setSlippage(sliceState, action: PayloadAction<{ slippage: number }>) {
      sliceState.swapSlippage = action.payload.slippage;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(transactInit.pending, (sliceState, action) => {
        resetForm(sliceState);

        sliceState.vaultId = action.meta.arg.vaultId;
        sliceState.step = TransactStep.Loading;
        sliceState.mode = TransactMode.Deposit;
        sliceState.options = initialTransactState['options'];
      })
      .addCase(transactInit.fulfilled, (sliceState, action) => {
        sliceState.vaultId = action.meta.arg.vaultId;
        sliceState.step = TransactStep.Form;
        sliceState.mode = TransactMode.Deposit;
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

          addOptionsToState(sliceState, action.payload.options);

          const defaultOption = first(action.payload.options);
          if (defaultOption) {
            sliceState.selectedSelectionId = defaultOption.selectionId;
            sliceState.selectedChainId = defaultOption.chainId;
          }
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
          sliceState.quotes.error = action.error;
          console.error(action.error);
        }
      })
      .addCase(transactFetchQuotes.fulfilled, (sliceState, action) => {
        if (sliceState.quotes.requestId === action.meta.requestId) {
          if (action.payload.quotes.length === 0) {
            sliceState.quotes.status = TransactStatus.Rejected;
            sliceState.quotes.error = { name: 'No quotes returned.' };
          } else {
            sliceState.quotes.status = TransactStatus.Fulfilled;

            addQuotesToState(sliceState, action.payload.quotes);

            if (sliceState.selectedQuoteId === undefined) {
              const firstQuote = first(action.payload.quotes);
              if (firstQuote) {
                sliceState.selectedQuoteId = firstQuote.id;
              }
            }
          }
        }
      });
  },
});

function resetForm(sliceState: Draft<TransactState>) {
  sliceState.selectedChainId = undefined;
  sliceState.selectedSelectionId = undefined;
  sliceState.inputAmount = BIG_ZERO;
  sliceState.inputMax = false;
  sliceState.dualInputAmounts = [BIG_ZERO, BIG_ZERO];
  sliceState.dualInputMax = [false, false];

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
  sliceState.migrateQuotes = initialTransactQuotes;
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
    if (!(option.selectionId in sliceState.selections.bySelectionId)) {
      sliceState.selections.bySelectionId[option.selectionId] = {
        id: option.selectionId,
        tokens: option.mode === TransactMode.Deposit ? option.inputs : option.wantedOutputs,
        order: option.selectionOrder,
      };

      sliceState.selections.allSelectionIds.push(option.selectionId);
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

export const transactActions = transactSlice.actions;
export const transactReducer = transactSlice.reducer;
