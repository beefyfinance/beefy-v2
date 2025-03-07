import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchOnRampQuote,
  fetchOnRampSupportedProviders,
  setOnRampFiat,
  setOnRampToken,
  validateOnRampForm,
} from '../actions/on-ramp.ts';
import type { Draft } from 'immer';
import type { ApiQuote, ApiQuoteRequest } from '../apis/on-ramp/on-ramp-types.ts';
import { first, orderBy } from 'lodash-es';
import type { OnRampTypes, Quote } from './on-ramp-types.ts';
import { CountryError, FormStep, InputMode } from './on-ramp-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isDefined } from '../utils/array-utils.ts';

const initialState: OnRampTypes = {
  step: FormStep.SelectToken,
  lastStep: FormStep.SelectToken,
  country: { value: undefined, error: undefined },
  fiat: { value: undefined, error: undefined },
  token: { value: undefined, error: undefined },
  network: { value: undefined, error: undefined },
  input: { value: 0, error: undefined, mode: InputMode.Fiat },
  canQuote: false,
  allFiat: [],
  byFiat: {},
  quote: {
    requestId: undefined,
    status: 'idle',
    error: undefined,
    request: undefined,
    response: undefined,
    providers: [],
    byProvider: {},
    provider: undefined,
    cheapestProvider: undefined,
  },
};

function clearQuote(sliceState: Draft<OnRampTypes>) {
  sliceState.quote = initialState.quote;
}

function processApiQuote(request: ApiQuoteRequest, provider: string, input: ApiQuote): Quote {
  let fiatAmount = request.amount;
  let tokenAmount = request.amount;

  if (request.amountType === 'fiat') {
    tokenAmount = (fiatAmount - input.fee) / input.quote;
  } else {
    fiatAmount = tokenAmount * input.quote + input.fee;
  }

  const rateAfterFee = tokenAmount / fiatAmount;

  return {
    provider,
    token: request.cryptoCurrency,
    tokenAmount,
    fiat: request.fiatCurrency,
    fiatAmount,
    rate: rateAfterFee,
    amountType: request.amountType === 'fiat' ? 'fiat' : 'token',
    network: request.network,
    paymentMethod: input.paymentMethod,
  };
}

function setStep(sliceState: Draft<OnRampTypes>, step: FormStep) {
  if (sliceState.step !== step) {
    const lastStep = sliceState.step;
    sliceState.step = step;
    sliceState.lastStep = lastStep;
  }
}

function pickFallbackFiat(allFiat: string[]): string {
  for (const fiat of ['USD', 'EUR', 'GBP', 'AUD', 'JPY', 'CAD']) {
    if (allFiat.includes(fiat)) {
      return fiat;
    }
  }

  return allFiat[0];
}

export const onRamp = createSlice({
  name: 'on-ramp',
  initialState: initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setStep(
      sliceState,
      action: PayloadAction<{
        step: FormStep;
      }>
    ) {
      setStep(sliceState, action.payload.step);
    },
    setInputAmount(
      sliceState,
      action: PayloadAction<{
        amount: number;
      }>
    ) {
      if (sliceState.input.value !== action.payload.amount) {
        clearQuote(sliceState);
        sliceState.input.value = action.payload.amount;
      }
    },
    toggleInputMode(sliceState) {
      clearQuote(sliceState);
      sliceState.input.mode =
        sliceState.input.mode === InputMode.Fiat ? InputMode.Token : InputMode.Fiat;
    },
    selectToken(
      sliceState,
      action: PayloadAction<{
        token: string;
      }>
    ) {
      if (sliceState.token.value !== action.payload.token) {
        clearQuote(sliceState);
        sliceState.token.value = action.payload.token;
      }

      setStep(sliceState, FormStep.SelectNetwork);
    },
    selectNetwork(
      sliceState,
      action: PayloadAction<{
        network: ChainEntity['id'];
      }>
    ) {
      if (sliceState.network.value !== action.payload.network) {
        clearQuote(sliceState);
        sliceState.network.value = action.payload.network;
      }

      setStep(sliceState, FormStep.InputAmount);
    },
    selectProvider(
      sliceState,
      action: PayloadAction<{
        provider: string;
      }>
    ) {
      if (sliceState.quote.provider !== action.payload.provider) {
        // Update state
        sliceState.quote.provider = action.payload.provider;
      }

      setStep(sliceState, FormStep.InputAmount);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOnRampSupportedProviders.fulfilled, (sliceState, action) => {
        sliceState.country.value = action.payload.countryCode;
        sliceState.fiat.value = action.payload.currencyCode;

        // Binance OnRamp has closed
        if ('binance' in action.payload.providers) {
          delete action.payload.providers.binance;
        }

        // Check if country is supported / has providers
        if (
          !action.payload.currencyCode ||
          !action.payload.countryCode ||
          !action.payload.providers ||
          Object.keys(action.payload.providers).length === 0
        ) {
          sliceState.country.error = CountryError.NotSupported;
          sliceState.step = FormStep.UnsupportedCountry;
          return;
        }

        // Process to fiat>token>network>provider>payment method
        for (const [providerKey, provider] of Object.entries(action.payload.providers)) {
          for (const [tokenSymbol, token] of Object.entries(provider)) {
            if (Object.keys(token.fiatCurrencies).length && token.networks.length) {
              for (const [fiatSymbol, paymentMethods] of Object.entries(token.fiatCurrencies)) {
                if (paymentMethods.length) {
                  if (!(fiatSymbol in sliceState.byFiat)) {
                    sliceState.allFiat.push(fiatSymbol);
                    sliceState.byFiat[fiatSymbol] = {
                      id: fiatSymbol,
                      allTokens: [],
                      byToken: {},
                    };
                  }
                  if (!(tokenSymbol in sliceState.byFiat[fiatSymbol].byToken)) {
                    sliceState.byFiat[fiatSymbol].allTokens.push(tokenSymbol);
                    sliceState.byFiat[fiatSymbol].byToken[tokenSymbol] = {
                      id: tokenSymbol,
                      allNetworks: [],
                      byNetwork: {},
                    };
                  }
                  for (const network of token.networks) {
                    if (
                      !(network in sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork)
                    ) {
                      sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].allNetworks.push(network);
                      sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[network] = {
                        id: network,
                        allProviders: [],
                        byProvider: {},
                        minFiat: Number.MAX_VALUE,
                        maxFiat: 0,
                      };
                    }
                    if (
                      !(
                        providerKey in
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[network]
                          .byProvider
                      )
                    ) {
                      sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[
                        network
                      ].allProviders.push(providerKey);
                      sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[
                        network
                      ].byProvider[providerKey] = {
                        id: providerKey,
                        allMethods: [],
                        byMethod: {},
                      };
                    }

                    for (const method of paymentMethods) {
                      const min =
                        method.minLimit === null || method.minLimit === 0 ? 0.01 : method.minLimit;
                      const max = method.maxLimit === null ? Number.MAX_VALUE : method.maxLimit;
                      if (
                        min <
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[network]
                          .minFiat
                      ) {
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[
                          network
                        ].minFiat = min;
                      }
                      if (
                        max >
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[network]
                          .maxFiat
                      ) {
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[
                          network
                        ].maxFiat = max;
                      }

                      if (
                        !(
                          method.paymentMethod in
                          sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[network]
                            .byProvider[providerKey].byMethod
                        )
                      ) {
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[
                          network
                        ].byProvider[providerKey].allMethods.push(method.paymentMethod);
                        sliceState.byFiat[fiatSymbol].byToken[tokenSymbol].byNetwork[
                          network
                        ].byProvider[providerKey].byMethod[method.paymentMethod] = {
                          id: method.paymentMethod,
                          minLimit: method.minLimit || undefined,
                          maxLimit: method.maxLimit || undefined,
                        };
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Select a difference currency if auto-detected one is not supported
        if (!(sliceState.fiat.value in sliceState.byFiat)) {
          sliceState.fiat.value = pickFallbackFiat(sliceState.allFiat);
        }

        // Move to select token step
        sliceState.step = FormStep.SelectToken;
      })
      .addCase(validateOnRampForm.pending, sliceState => {
        sliceState.canQuote = false;
      })
      .addCase(validateOnRampForm.fulfilled, (sliceState, action) => {
        sliceState.canQuote = false;
        sliceState.fiat.error = action.payload.fiat;
        sliceState.token.error = action.payload.token;
        sliceState.network.error = action.payload.network;
        sliceState.input.error = action.payload.input;
        sliceState.canQuote =
          !action.payload.fiat &&
          !action.payload.token &&
          !action.payload.network &&
          !action.payload.input;
      })
      .addCase(fetchOnRampQuote.pending, (sliceState, action) => {
        sliceState.quote.requestId = action.meta.requestId;
        sliceState.quote.status = 'pending';
        sliceState.quote.request = action.meta.arg;
        sliceState.quote.response = undefined;
        sliceState.quote.error = undefined;
      })
      .addCase(fetchOnRampQuote.rejected, (sliceState, action) => {
        if (sliceState.quote.requestId === action.meta.requestId) {
          sliceState.quote.status = 'rejected';
          sliceState.quote.error = action.error;
        }
      })
      .addCase(fetchOnRampQuote.fulfilled, (sliceState, action) => {
        const request = action.meta.arg;
        const response = action.payload;

        if (sliceState.quote.requestId === action.meta.requestId) {
          const quotes = Object.entries(response)
            .map(([provider, quotes]) => {
              const cheapest = first(
                orderBy(
                  quotes.map(quote => processApiQuote(request, provider, quote)),
                  'rate',
                  'desc'
                )
              );

              return cheapest ? cheapest : undefined;
            })
            .filter(isDefined);

          if (quotes.length) {
            const cheapestQuote = first(orderBy(quotes, 'rate', 'desc'))!; // we just checked length

            sliceState.quote.status = 'fulfilled';
            sliceState.quote.error = undefined;
            sliceState.quote.response = action.payload;
            sliceState.quote.byProvider = quotes.reduce(
              (all, next) => {
                all[next.provider] = next;
                return all;
              },
              {} as Record<string, Quote>
            );
            sliceState.quote.providers = Object.keys(sliceState.quote.byProvider);
            sliceState.quote.cheapestProvider = cheapestQuote.provider;
            sliceState.quote.provider = sliceState.quote.cheapestProvider;
          } else {
            sliceState.quote.status = 'rejected';
            sliceState.quote.error = {
              message: 'No quotes available.',
            };
          }
        }
      })
      .addCase(setOnRampFiat.fulfilled, (sliceState, action) => {
        if (sliceState.fiat.value !== action.payload.fiat) {
          clearQuote(sliceState);
          sliceState.fiat.value = action.payload.fiat;
        }

        setStep(sliceState, action.payload.step);
      })
      .addCase(setOnRampToken.fulfilled, (sliceState, action) => {
        if (sliceState.token.value !== action.payload.token) {
          clearQuote(sliceState);
          sliceState.token.value = action.payload.token;
        }

        setStep(sliceState, action.payload.step);
      });
  },
});

export const onRampFormActions = onRamp.actions;
