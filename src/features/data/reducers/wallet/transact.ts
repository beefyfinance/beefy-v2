import { BigNumber } from 'bignumber.js';
import { first } from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { transactFetchDepositOptions, transactInit } from '../../actions/transact';
import { VaultEntity } from '../../entities/vault';
import { TransactOption } from '../../apis/transact/transact-types';
import { ChainEntity } from '../../entities/chain';
import { logger } from '../../utils/logger';
import { WritableDraft } from 'immer/dist/internal';
import { TokenEntity } from '../../entities/token';
import { BIG_ZERO } from '../../../../helpers/big-number';

export enum TransactStep {
  Loading,
  Form,
  TokenSelect,
  RouteNotice,
}

export enum TransactMode {
  Deposit,
  Withdraw,
}

export enum TransactStatus {
  Idle,
  Pending,
  Rejected,
  Fulfilled,
}

export type TransactTokens = {
  allTokensIds: string[];
  byTokensId: Record<TransactOption['tokensId'], TokenEntity['address'][]>;
  allChainIds: ChainEntity['id'][];
  byChainId: Record<ChainEntity['id'], TransactOption['tokensId'][]>;
};

const initialTransactTokens: TransactTokens = {
  allTokensIds: [],
  byTokensId: {},
  allChainIds: [],
  byChainId: {},
};

export type TransactOptions = {
  vaultId: VaultEntity['id'];
  mode: TransactMode;
  status: TransactStatus;
  allOptionIds: TransactOption['id'][];
  byOptionId: Record<TransactOption['id'], TransactOption>;
  byTokensId: Record<TransactOption['tokensId'], TransactOption['id'][]>;
};

const initialTransactOptions: TransactOptions = {
  vaultId: null,
  mode: TransactMode.Deposit,
  status: TransactStatus.Idle,
  allOptionIds: [],
  byOptionId: {},
  byTokensId: {},
};

export type TransactState = {
  vaultId: VaultEntity['id'] | null;
  selectedChainId: string | null;
  selectedTokensId: string | null;
  selectedQuoteId: string | null;
  inputAmount: BigNumber;
  mode: TransactMode;
  step: TransactStep;
  tokens: TransactTokens;
  options: TransactOptions;
};

const initialTransactState: TransactState = {
  vaultId: null,
  selectedChainId: null,
  selectedTokensId: null,
  selectedQuoteId: null,
  inputAmount: BIG_ZERO,
  mode: TransactMode.Deposit,
  step: TransactStep.Form,
  tokens: initialTransactTokens,
  options: initialTransactOptions,
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
    selectToken(sliceState, action: PayloadAction<string>) {
      sliceState.selectedTokensId = action.payload;
      sliceState.inputAmount = BIG_ZERO;
      sliceState.step = TransactStep.Form;
    },
    setInputAmount(sliceState, action: PayloadAction<BigNumber>) {
      if (!sliceState.inputAmount.isEqualTo(action.payload)) {
        sliceState.inputAmount = action.payload;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(transactInit.pending, (sliceState, action) => {
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
      .addCase(transactFetchDepositOptions.pending, (sliceState, action) => {
        sliceState.options.vaultId = action.meta.arg.vaultId;
        sliceState.options.mode = TransactMode.Deposit;
        sliceState.options.status = TransactStatus.Pending;

        sliceState.selectedChainId = null;
        sliceState.selectedTokensId = null;

        sliceState.tokens.allTokensIds = [];
        sliceState.tokens.allChainIds = [];
        sliceState.tokens.byTokensId = {};
        sliceState.tokens.byChainId = {};

        sliceState.options.allOptionIds = [];
        sliceState.options.byOptionId = {};
        sliceState.options.byTokensId = {};
      })
      .addCase(transactFetchDepositOptions.rejected, (sliceState, action) => {
        if (sliceState.vaultId === action.meta.arg.vaultId) {
          sliceState.options.status = TransactStatus.Rejected;
        }
      })
      .addCase(transactFetchDepositOptions.fulfilled, (sliceState, action) => {
        logger.log('transact reducer', action.payload);
        if (sliceState.vaultId === action.meta.arg.vaultId) {
          sliceState.options.status = TransactStatus.Fulfilled;

          addOptionsToState(sliceState, action.payload.options);

          const defaultOption = first(action.payload.options);
          sliceState.selectedTokensId = defaultOption.tokensId;
          sliceState.selectedChainId = defaultOption.chainId;
        }
      });
  },
});

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
    } else {
      sliceState.tokens.byChainId[option.chainId].push(option.tokensId);
    }
  }
}

export const transactActions = transactSlice.actions;
export const transactReducer = transactSlice.reducer;
