import { createSlice, type PayloadAction, type SerializedError } from '@reduxjs/toolkit';
import {
  confirmBridgeForm,
  fetchBridgeConfig,
  initiateBridgeForm,
  performBridge,
  quoteBridgeForm,
  validateBridgeForm,
} from '../../actions/bridge';
import type { ChainEntity } from '../../entities/chain';
import type { BeefyAnyBridgeConfig, BeefyBridgeIdToConfig } from '../../apis/config-types';
import type { InputTokenAmount } from '../../apis/transact/transact-types';
import { isTokenEqual, type TokenErc20 } from '../../entities/token';
import { BIG_ZERO } from '../../../../helpers/big-number';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types';
import type { Draft } from 'immer';
import { keyBy, pick } from 'lodash-es';
import type BigNumber from 'bignumber.js';

export enum FormStep {
  Loading = 1,
  Preview,
  Confirm,
  Transaction,
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
  limitedQuotes: {
    allIds: IBridgeQuote<BeefyAnyBridgeConfig>['id'][];
    byId: Partial<
      Record<IBridgeQuote<BeefyAnyBridgeConfig>['id'], IBridgeQuote<BeefyAnyBridgeConfig>>
    >;
  };
  error: SerializedError | null;
  limitError?: { current: BigNumber; max: BigNumber; canWait: boolean };
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
  tokens: Record<ChainEntity['id'], string>;
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
  tokens: {},
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
    limitedQuotes: {
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
    restart(sliceState) {
      resetQuotes(sliceState);
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.step = FormStep.Preview;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBridgeConfig.fulfilled, (sliceState, action) => {
        const { config } = action.payload;
        const allChains = Object.keys(config.tokens);
        const chainToBridges = allChains.reduce((allMap, fromChainId) => {
          allMap[fromChainId] = allChains.reduce((chainMap, toChainId) => {
            chainMap[toChainId] = config.bridges
              .filter(bridge => {
                return (
                  fromChainId !== toChainId &&
                  fromChainId in bridge.chains &&
                  !bridge.chains[fromChainId].sendDisabled &&
                  toChainId in bridge.chains &&
                  !bridge.chains[toChainId].receiveDisabled
                );
              })
              .map(bridge => bridge.id);

            return chainMap;
          }, {});
          return allMap;
        }, {});

        sliceState.source = config.source.chainId;
        sliceState.tokens = config.tokens;
        sliceState.destinations = {
          allChains,
          chainToAddress: { ...config.tokens, [config.source.chainId]: config.source.address },
          chainToBridges,
          chainToChain: allChains.reduce((allMap, chainId) => {
            allMap[chainId] = allChains.filter(
              otherChainId => chainToBridges[chainId]?.[otherChainId]?.length > 0
            );
            return allMap;
          }, {}),
        };
        sliceState.bridges = keyBy(config.bridges, 'id');
      })
      .addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
        const { form } = action.payload;
        sliceState.form = form;
        resetQuotes(sliceState);
      })
      .addCase(validateBridgeForm.pending, (sliceState, action) => {
        sliceState.validate.requestId = action.meta.requestId;

        // We set quote to pending status if we previously validated successfully to reduce flicker
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
        resetQuotes(sliceState);
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
        setQuotes(sliceState, 'quotes', action.payload.quotes);
        setQuotes(sliceState, 'limitedQuotes', action.payload.limitedQuotes);
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
        if (action.meta.rejectedWithValue) {
          sliceState.quote.error = {
            message: 'Reduce bridge amount or try again later',
            name: action.payload,
          };
          sliceState.quote.limitError = pick(action.meta, ['current', 'max', 'canWait']);
        } else {
          sliceState.quote.limitError = undefined;
        }
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
      })
      .addCase(performBridge.fulfilled, (sliceState, _action) => {
        sliceState.form.step = FormStep.Transaction;
      });
  },
});

function setQuotes(
  sliceState: Draft<BridgeState>,
  key: 'quotes' | 'limitedQuotes',
  quotes: IBridgeQuote<BeefyAnyBridgeConfig>[]
) {
  sliceState.quote[key].byId = quotes.reduce((map, quote) => {
    map[quote.id] = quote;
    return map;
  }, {});
  sliceState.quote[key].allIds = quotes.map(quote => quote.id);
}

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
