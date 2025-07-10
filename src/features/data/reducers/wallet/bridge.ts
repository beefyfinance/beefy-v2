import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { keyBy, pick } from 'lodash-es';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { keys } from '../../../../helpers/object.ts';
import {
  confirmBridgeForm,
  fetchBridgeConfig,
  initiateBridgeForm,
  performBridge,
  quoteBridgeForm,
  validateBridgeForm,
} from '../../actions/bridge.ts';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types.ts';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types.ts';
import type { InputTokenAmount } from '../../apis/transact/transact-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { isTokenEqual, type TokenErc20 } from '../../entities/token.ts';
import { type BridgeState, FormStep } from './bridge-types.ts';

const initialBridgeState: BridgeState = {
  source: undefined,
  tokens: {},
  destinations: {
    allChains: [],
    chainToAddress: {},
    chainToChain: {},
    chainToBridges: {},
  },
  bridges: undefined,
  form: undefined,
  validate: {
    status: 'idle',
    requestId: undefined,
  },
  quote: {
    status: 'idle',
    selected: undefined,
    quotes: {
      allIds: [],
      byId: {},
    },
    limitedQuotes: {
      allIds: [],
      byId: {},
    },
    error: undefined,
    requestId: undefined,
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
    setStep(
      sliceState,
      action: PayloadAction<{
        step: FormStep;
      }>
    ) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }
      sliceState.form.step = action.payload.step;
    },
    reverseDirection(sliceState) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }
      const { from, to } = sliceState.form;
      sliceState.form.to = from;
      sliceState.form.from = to;
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.input.max = false;
      sliceState.form.receiverIsDifferent = false;
      sliceState.form.receiverAddress = undefined;

      resetQuotes(sliceState);
    },
    setFromChain(
      sliceState,
      action: PayloadAction<{
        chainId: ChainEntity['id'];
      }>
    ) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }
      sliceState.form.from = action.payload.chainId;
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.input.max = false;
      sliceState.form.receiverIsDifferent = false;
      sliceState.form.receiverAddress = undefined;

      if (sliceState.form.to === action.payload.chainId) {
        const otherChains = sliceState.destinations.allChains.filter(
          chainId => chainId !== action.payload.chainId
        );
        sliceState.form.to = otherChains[0];
      }

      sliceState.form.step = FormStep.Preview;

      resetQuotes(sliceState);
    },
    setToChain(
      sliceState,
      action: PayloadAction<{
        chainId: ChainEntity['id'];
      }>
    ) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }
      sliceState.form.to = action.payload.chainId;
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.input.max = false;
      sliceState.form.receiverIsDifferent = false;
      sliceState.form.receiverAddress = undefined;

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
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }

      let changed = false;

      if (!sliceState.form.input.amount.isEqualTo(action.payload.amount)) {
        sliceState.form.input.amount = action.payload.amount;
        changed = true;
      }
      if (sliceState.form.input.max !== action.payload.max) {
        sliceState.form.input.max = action.payload.max;
        changed = true;
      }
      if (!isTokenEqual(sliceState.form.input.token, action.payload.token)) {
        sliceState.form.input.token = action.payload.token;
        changed = true;
      }

      if (changed) {
        resetQuotes(sliceState);
      }
    },
    setReceiverIsDifferent(sliceState, action: PayloadAction<boolean>) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }
      let changed = false;

      if (sliceState.form.receiverIsDifferent !== action.payload) {
        sliceState.form.receiverIsDifferent = action.payload;
        changed = true;
      }

      if (changed) {
        resetQuotes(sliceState);
      }
    },
    setReceiverAddress(sliceState, action: PayloadAction<string | undefined>) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }

      let changed = false;

      if (sliceState.form.receiverAddress !== action.payload) {
        changed = true;
        sliceState.form.receiverAddress = action.payload;
      }

      if (changed) {
        resetQuotes(sliceState);
      }
    },
    selectQuote(
      sliceState,
      action: PayloadAction<{
        quoteId: BeefyAnyBridgeConfig['id'];
      }>
    ) {
      const { quoteId } = action.payload;

      if (quoteId in sliceState.quote.quotes.byId) {
        sliceState.quote.selected = action.payload.quoteId;
      } else {
        sliceState.quote.selected = undefined;
      }
    },
    unselectQuote(sliceState) {
      sliceState.quote.selected = undefined;
    },
    restart(sliceState) {
      if (!sliceState.form) {
        throw new Error(`Bridge form not initialized.`);
      }
      resetQuotes(sliceState);
      sliceState.form.input.amount = BIG_ZERO;
      sliceState.form.step = FormStep.Preview;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBridgeConfig.fulfilled, (sliceState, action) => {
        const { config } = action.payload;
        const allChains = keys(config.tokens);
        const chainToBridges = allChains.reduce(
          (allMap, fromChainId) => {
            allMap[fromChainId] = allChains.reduce(
              (chainMap, toChainId) => {
                chainMap[toChainId] = config.bridges
                  .filter(bridge => {
                    const fromChain = bridge.chains[fromChainId];
                    const toChain = bridge.chains[toChainId];
                    return (
                      fromChainId !== toChainId &&
                      fromChain &&
                      !fromChain.sendDisabled &&
                      toChain &&
                      !toChain.receiveDisabled
                    );
                  })
                  .map(bridge => bridge.id);

                return chainMap;
              },
              {} as Record<ChainEntity['id'], BeefyAnyBridgeConfig['id'][]>
            );
            return allMap;
          },
          {} as Record<ChainEntity['id'], Record<ChainEntity['id'], BeefyAnyBridgeConfig['id'][]>>
        );

        sliceState.source = config.source;
        sliceState.tokens = config.tokens;
        sliceState.destinations = {
          allChains,
          chainToAddress: { ...config.tokens, [config.source.chainId]: config.source.address },
          chainToBridges,
          chainToChain: allChains.reduce(
            (allMap, chainId) => {
              allMap[chainId] = allChains.filter(
                otherChainId => chainToBridges[chainId]?.[otherChainId]?.length > 0
              );
              return allMap;
            },
            {} as Record<ChainEntity['id'], ChainEntity['id'][]>
          ),
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
        sliceState.quote.selected = action.payload.quotes[0]?.id || undefined;
        sliceState.quote.error = undefined;
      })
      .addCase(quoteBridgeForm.rejected, (sliceState, action) => {
        if (sliceState.quote.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.quote.status = 'rejected';
        sliceState.quote.selected = undefined;
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
        if (!sliceState.form) {
          throw new Error(`Bridge form not initialized.`);
        }
        sliceState.confirm.status = 'pending';
        sliceState.confirm.requestId = action.meta.requestId;
        sliceState.confirm.error = undefined;
        sliceState.form.step = FormStep.Confirm;
      })
      .addCase(confirmBridgeForm.fulfilled, (sliceState, action) => {
        if (sliceState.confirm.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.confirm.status = 'fulfilled';
        sliceState.confirm.quote = action.payload.quote;
        sliceState.confirm.error = undefined;
      })
      .addCase(confirmBridgeForm.rejected, (sliceState, action) => {
        if (sliceState.confirm.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.confirm.status = 'rejected';
        sliceState.confirm.quote = undefined;
        sliceState.confirm.error = action.error;
      })
      .addCase(performBridge.fulfilled, (sliceState, _action) => {
        if (!sliceState.form) {
          throw new Error(`Bridge form not initialized.`);
        }
        sliceState.form.step = FormStep.Transaction;
      });
  },
});

function setQuotes(
  sliceState: Draft<BridgeState>,
  key: 'quotes' | 'limitedQuotes',
  quotes: IBridgeQuote<BeefyAnyBridgeConfig>[]
) {
  sliceState.quote[key].byId = quotes.reduce(
    (map, quote) => {
      map[quote.id] = quote;
      return map;
    },
    {} as Record<BeefyAnyBridgeConfig['id'], IBridgeQuote<BeefyAnyBridgeConfig>>
  );
  sliceState.quote[key].allIds = quotes.map(quote => quote.id);
}

function resetQuotes(
  sliceState: Draft<BridgeState>,
  status: BridgeState['quote']['status'] = 'idle'
) {
  sliceState.quote.status = status;
  sliceState.quote.requestId = undefined;
  sliceState.quote.selected = undefined;
  sliceState.quote.error = undefined;
}

export const bridgeActions = bridgeSlice.actions;
