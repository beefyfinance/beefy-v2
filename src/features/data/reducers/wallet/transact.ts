import { BigNumber } from 'bignumber.js';
import { first } from 'lodash';
import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { transactFetchOptions, transactFetchQuotes, transactInit } from '../../actions/transact';
import {
  QuoteOutputTokenAmountChange,
  TransactOption,
  TransactQuote,
} from '../../apis/transact/transact-types';
import { WritableDraft } from 'immer/dist/internal';
import { BIG_ZERO } from '../../../../helpers/big-number';
import {
  TransactMode,
  TransactOptions,
  TransactQuotes,
  TransactState,
  TransactStatus,
  TransactStep,
  TransactTokens,
} from './transact-types';

const initialTransactTokens: TransactTokens = {
  allTokensIds: [],
  byTokensId: {},
  allChainIds: [],
  byChainId: {},
};

const initialTransactOptions: TransactOptions = {
  vaultId: null,
  mode: TransactMode.Deposit,
  status: TransactStatus.Idle,
  requestId: null,
  error: null,
  allOptionIds: [],
  byOptionId: {},
  byTokensId: {},
};

const initialTransactQuotes: TransactQuotes = {
  allQuoteIds: [],
  byQuoteId: {},
  status: TransactStatus.Idle,
  requestId: null,
  error: null,
};

const initialTransactConfirm = {
  changes: [],
  status: TransactStatus.Idle,
  requestId: null,
  error: null,
};

const initialTransactState: TransactState = {
  vaultId: null,
  selectedChainId: null,
  selectedTokensId: null,
  selectedQuoteId: null,
  swapSlippage: 0.01, // 1%s
  inputAmount: BIG_ZERO,
  inputMax: false,
  mode: TransactMode.Deposit,
  step: TransactStep.Form,
  tokens: initialTransactTokens,
  options: initialTransactOptions,
  quotes: initialTransactQuotes,
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
    },
    switchStep(sliceState, action: PayloadAction<TransactStep>) {
      sliceState.step = action.payload;
    },
    selectToken(sliceState, action: PayloadAction<{ tokensId: string; resetInput: boolean }>) {
      sliceState.selectedTokensId = action.payload.tokensId;
      sliceState.step = TransactStep.Form;
      if (action.payload.resetInput) {
        sliceState.inputAmount = BIG_ZERO;
        sliceState.inputMax = false;
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
    clearQuotes(sliceState) {
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

        delete sliceState.quotes.byQuoteId[action.payload.originalQuoteId];
        sliceState.quotes.byQuoteId[action.payload.newQuote.id] = action.payload.newQuote;
        sliceState.quotes.allQuoteIds = Object.keys(sliceState.quotes.byQuoteId);
        sliceState.selectedQuoteId = action.payload.newQuote.id;
      }
    },
    confirmUnneeded(sliceState, action: PayloadAction<{ requestId: string }>) {
      if (sliceState.confirm.requestId === action.payload.requestId) {
        sliceState.confirm.status = TransactStatus.Fulfilled;
        sliceState.confirm.changes = [];
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
        }
      })
      .addCase(transactFetchOptions.fulfilled, (sliceState, action) => {
        if (sliceState.options.requestId === action.meta.requestId) {
          sliceState.options.status = TransactStatus.Fulfilled;

          addOptionsToState(sliceState, action.payload.options);

          const defaultOption = first(action.payload.options);
          sliceState.selectedTokensId = defaultOption.tokensId;
          sliceState.selectedChainId = defaultOption.chainId;
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

            if (sliceState.selectedQuoteId === null) {
              const firstQuote = first(action.payload.quotes);
              sliceState.selectedQuoteId = firstQuote.id;
            }
          }
        }
      });
  },
});

function resetForm(sliceState: WritableDraft<TransactState>) {
  sliceState.selectedChainId = null;
  sliceState.selectedTokensId = null;
  sliceState.inputAmount = BIG_ZERO;
  sliceState.inputMax = false;

  sliceState.options.status = TransactStatus.Idle;
  sliceState.options.error = null;
  sliceState.options.allOptionIds = [];
  sliceState.options.byOptionId = {};
  sliceState.options.byTokensId = {};

  sliceState.tokens.allTokensIds = [];
  sliceState.tokens.allChainIds = [];
  sliceState.tokens.byTokensId = {};
  sliceState.tokens.byChainId = {};

  resetQuotes(sliceState);
}

function resetQuotes(sliceState: WritableDraft<TransactState>) {
  sliceState.selectedQuoteId = null;
  sliceState.quotes.status = TransactStatus.Idle;
  sliceState.quotes.allQuoteIds = [];
  sliceState.quotes.byQuoteId = {};
  sliceState.quotes.error = null;
  sliceState.quotes.requestId = null;

  resetConfirm(sliceState);
}

function resetConfirm(sliceState: WritableDraft<TransactState>) {
  sliceState.confirm.requestId = null;
  sliceState.confirm.error = null;
  sliceState.confirm.status = TransactStatus.Idle;
  sliceState.confirm.changes = [];
}

function addQuotesToState(sliceState: WritableDraft<TransactState>, quotes: TransactQuote[]) {
  for (const quote of quotes) {
    if (quote.id in sliceState.quotes.byQuoteId) {
      console.warn(`Attempting to add duplicate quote id ${quote.id} to state`);
      continue;
    }

    sliceState.quotes.byQuoteId[quote.id] = quote;
    sliceState.quotes.allQuoteIds.push(quote.id);
  }
}

function addOptionsToState(sliceState: WritableDraft<TransactState>, options: TransactOption[]) {
  for (const option of options) {
    if (option.id in sliceState.options.byOptionId) {
      console.warn(`Attempting to add duplicate option id ${option.id} to state`);
      continue;
    }

    // Add optionId => option mapping
    sliceState.options.byOptionId[option.id] = option;
    sliceState.options.allOptionIds.push(option.id);

    // Add tokensId -> optionId[] mapping
    if (!(option.tokensId in sliceState.options.byTokensId)) {
      sliceState.options.byTokensId[option.tokensId] = [option.id];
    } else {
      sliceState.options.byTokensId[option.tokensId].push(option.id);
    }

    // Add tokensId -> address[] mapping
    if (!(option.tokensId in sliceState.tokens.byTokensId)) {
      sliceState.tokens.byTokensId[option.tokensId] = option.tokenAddresses;
      sliceState.tokens.allTokensIds.push(option.tokensId);
    }

    // Add chainId -> tokensId[] mapping
    if (!(option.chainId in sliceState.tokens.byChainId)) {
      sliceState.tokens.byChainId[option.chainId] = [option.tokensId];
      sliceState.tokens.allChainIds.push(option.chainId);
    } else if (!sliceState.tokens.byChainId[option.chainId].includes(option.tokensId)) {
      sliceState.tokens.byChainId[option.chainId].push(option.tokensId);
    }
  }
}

export const transactActions = transactSlice.actions;
export const transactReducer = transactSlice.reducer;
