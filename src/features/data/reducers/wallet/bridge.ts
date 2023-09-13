import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import {
  confirmBridgeForm,
  fetchBridgeConfig,
  initiateBridgeForm,
  quoteBridgeForm,
  validateBridgeForm,
} from '../../actions/bridge';
import type { ChainEntity } from '../../entities/chain';
import type {
  BeefyAnyBridgeConfig,
  BeefyBridgeConfig,
  BeefyBridgeIdToConfig,
} from '../../apis/config-types';
import type { InputTokenAmount, TokenAmount } from '../../apis/transact/transact-types';
import { isTokenEqual, TokenErc20 } from '../../entities/token';
import { BIG_ZERO } from '../../../../helpers/big-number';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types';
import type { Draft } from 'immer';
import { keyBy } from 'lodash-es';

export enum FormStep {
  Loading = 1,
  Preview,
  Confirm,
  SelectFromNetwork,
  SelectToNetwork,
}

export type BridgeFormState = {
  step: FormStep;
  from: ChainEntity['id'];
  to: ChainEntity['id'];
  input: InputTokenAmount<TokenErc20>;
};

export type BridgeValidateState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  requestId?: string;
};

export type BridgeQuoteState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  selected: string | null;
  quotes: {
    allIds: IBridgeQuote<BeefyAnyBridgeConfig>['id'][];
    byId: Partial<
      Record<IBridgeQuote<BeefyAnyBridgeConfig>['id'], IBridgeQuote<BeefyAnyBridgeConfig>>
    >;
  };
  error: SerializedError | null;
  requestId: string | null;
};

export type BridgeConfirmState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  requestId?: string;
  error?: SerializedError;
  quote?: IBridgeQuote<BeefyAnyBridgeConfig>;
  outgoing?: { hash: string; mined: boolean };
  incoming?: { hash: string; mined: boolean };
};

export type BridgesMap = {
  [K in BeefyAnyBridgeConfig['id']]?: BeefyBridgeIdToConfig<K>;
};

export type BridgeState = {
  source: ChainEntity['id'];
  destinations: {
    allChains: ChainEntity['id'][];
    chainToAddress: Record<ChainEntity['id'], string>;
    chainToChain: Record<ChainEntity['id'], ChainEntity['id'][]>;
    chainToBridges: Record<
      ChainEntity['id'],
      Record<ChainEntity['id'], BeefyAnyBridgeConfig['id'][]>
    >;
  };
  bridges: BridgesMap | undefined;
  form: BridgeFormState;
  validate: BridgeValidateState;
  quote: BridgeQuoteState;
  confirm: BridgeConfirmState;
};

const initialBridgeState: BridgeState = {
  source: null,
  destinations: {
    allChains: [],
    chainToAddress: {},
    chainToChain: {},
    chainToBridges: {},
  },
  bridges: undefined,
  form: {
    step: FormStep.Loading,
    from: null,
    to: null,
    input: {
      amount: BIG_ZERO,
      max: false,
      token: null,
    },
  },
  validate: {
    status: 'idle',
    requestId: undefined,
  },
  quote: {
    status: 'idle',
    selected: null,
    quotes: {
      allIds: [],
      byId: {},
    },
    error: null,
    requestId: null,
  },
  confirm: {
    status: 'idle',
    requestId: undefined,
    quote: undefined,
    outgoing: undefined,
    incoming: undefined,
  },
};

export const bridgeSlice = createSlice({
  name: 'bridge',
  initialState: initialBridgeState,
  reducers: {
    setStep(sliceState, action: PayloadAction<{ step: FormStep }>) {
      sliceState.form.step = action.payload.step;
    },
    reverseDirection(sliceState) {
      const { from, to } = sliceState.form;
      sliceState.form.to = from;
      sliceState.form.from = to;
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.input.max = false;

      resetQuotes(sliceState);
    },
    setFromChain(sliceState, action: PayloadAction<{ chainId: ChainEntity['id'] }>) {
      sliceState.form.from = action.payload.chainId;
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.input.max = false;

      if (sliceState.form.to === action.payload.chainId) {
        const otherChains = sliceState.destinations.allChains.filter(
          chainId => chainId !== action.payload.chainId
        );
        sliceState.form.to = otherChains[0];
      }

      sliceState.form.step = FormStep.Preview;

      resetQuotes(sliceState);
    },
    setToChain(sliceState, action: PayloadAction<{ chainId: ChainEntity['id'] }>) {
      sliceState.form.to = action.payload.chainId;
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.input.max = false;

      if (sliceState.form.from === action.payload.chainId) {
        const otherChains = sliceState.destinations.allChains.filter(
          chainId => chainId !== action.payload.chainId
        );
        sliceState.form.from = otherChains[0];
      }

      sliceState.form.step = FormStep.Preview;

      resetQuotes(sliceState);
    },
    setInputAmount(sliceState, action: PayloadAction<InputTokenAmount<TokenErc20>>) {
      if (!sliceState.form.input.amount.isEqualTo(action.payload.amount)) {
        sliceState.form.input.amount = action.payload.amount;
      }
      if (sliceState.form.input.max !== action.payload.max) {
        sliceState.form.input.max = action.payload.max;
      }
      if (!isTokenEqual(sliceState.form.input.token, action.payload.token)) {
        sliceState.form.input.token = action.payload.token;
      }

      // Skip empty idle screen if we think quote validation will succeed
      // resetQuotes(
      //   sliceState,
      //   action.payload.amount.gt(BIG_ZERO) && sliceState.quote.status === 'fulfilled'
      //     ? 'pending'
      //     : 'idle'
      // );
    },
    selectQuote(sliceState, action: PayloadAction<{ quoteId: string }>) {
      const { quoteId } = action.payload;

      if (quoteId in sliceState.quote.quotes.byId) {
        sliceState.quote.selected = action.payload.quoteId;
      } else {
        sliceState.quote.selected = null;
      }
    },
    unselectQuote(sliceState) {
      sliceState.quote.selected = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBridgeConfig.fulfilled, (sliceState, action) => {
        const { config } = action.payload;
        const allChains = Object.keys(config.tokens);
        const chainToBridges = allChains.reduce((allMap, chainId) => {
          allMap[chainId] = allChains.reduce((chainMap, otherChainId) => {
            chainMap[otherChainId] = config.bridges
              .filter(bridge => {
                return (
                  chainId !== otherChainId &&
                  chainId in bridge.chains &&
                  otherChainId in bridge.chains
                );
              })
              .map(bridge => bridge.id);

            return chainMap;
          }, {});
          return allMap;
        }, {});

        sliceState.source = config.source.chainId;
        sliceState.destinations = {
          allChains,
          chainToAddress: config.tokens,
          chainToBridges,
          chainToChain: allChains.reduce((allMap, chainId) => {
            allMap[chainId] = allChains.filter(
              otherChainId => chainToBridges[chainId]?.[otherChainId]?.length > 0
            );
            return allMap;
          }, {}),
        };
        sliceState.destinations.chainToAddress[config.source.chainId] = config.source.address;
        sliceState.bridges = keyBy(config.bridges, 'id');
      })
      .addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
        const { form } = action.payload;
        sliceState.form = form;
        resetQuotes(sliceState);
      })
      .addCase(validateBridgeForm.pending, (sliceState, action) => {
        sliceState.validate.requestId = action.meta.requestId;

        resetQuotes(sliceState, sliceState.validate.status === 'fulfilled' ? 'pending' : 'idle');
      })
      .addCase(validateBridgeForm.fulfilled, (sliceState, action) => {
        if (sliceState.validate.requestId !== action.meta.requestId) {
          return;
        }

        sliceState.validate.status = 'fulfilled';
      })
      .addCase(validateBridgeForm.rejected, (sliceState, action) => {
        if (sliceState.validate.requestId !== action.meta.requestId) {
          return;
        }

        sliceState.validate.status = 'rejected';
      })
      .addCase(quoteBridgeForm.pending, (sliceState, action) => {
        resetQuotes(sliceState, 'pending');
        sliceState.quote.requestId = action.meta.requestId;
      })
      .addCase(quoteBridgeForm.fulfilled, (sliceState, action) => {
        if (sliceState.quote.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.quote.status = 'fulfilled';
        sliceState.quote.quotes.byId = action.payload.quotes.reduce((map, quote) => {
          map[quote.id] = quote;
          return map;
        }, {});
        sliceState.quote.quotes.allIds = action.payload.quotes.map(quote => quote.id);
        sliceState.quote.selected = action.payload.quotes[0]?.id || null;
        sliceState.quote.error = null;
      })
      .addCase(quoteBridgeForm.rejected, (sliceState, action) => {
        if (sliceState.quote.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.quote.status = 'rejected';
        sliceState.quote.selected = null;
        sliceState.quote.error = action.error;
      })
      .addCase(confirmBridgeForm.pending, (sliceState, action) => {
        sliceState.confirm.status = 'pending';
        sliceState.confirm.requestId = action.meta.requestId;
        sliceState.confirm.error = null;
        sliceState.form.step = FormStep.Confirm;
      })
      .addCase(confirmBridgeForm.fulfilled, (sliceState, action) => {
        if (sliceState.confirm.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.confirm.status = 'fulfilled';
        sliceState.confirm.quote = action.payload.quote;
        sliceState.confirm.error = null;
      })
      .addCase(confirmBridgeForm.rejected, (sliceState, action) => {
        if (sliceState.confirm.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.confirm.status = 'rejected';
        sliceState.confirm.quote = null;
        sliceState.confirm.error = action.error;
      });
  },
});

function resetQuotes(
  sliceState: Draft<BridgeState>,
  status: BridgeState['quote']['status'] = 'idle'
) {
  sliceState.quote.status = status;
  sliceState.quote.requestId = null;
  sliceState.quote.selected = null;
  sliceState.quote.error = null;
}

export const bridgeActions = bridgeSlice.actions;
