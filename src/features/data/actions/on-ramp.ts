import { getOnRampApi } from '../apis/instances.ts';
import type {
  ApiQuoteRequest,
  ApiQuoteResponse,
  ApiSupportedResponse,
} from '../apis/on-ramp/on-ramp-types.ts';
import {
  FiatError,
  FormStep,
  InputError,
  InputMode,
  NetworkError,
  TokenError,
} from '../reducers/on-ramp-types.ts';
import {
  selectFiat,
  selectFiatOrUndefined,
  selectFiatTokenMinMaxFiat,
  selectInputAmount,
  selectInputModeOrUndefined,
  selectIsFiatSupported,
  selectIsFiatTokenNetworkSupported,
  selectIsFiatTokenSupported,
  selectNetworkOrUndefined,
  selectProvidersForFiatTokenNetwork,
  selectToken,
  selectTokenOrUndefined,
} from '../selectors/on-ramp.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FulfilledSupportedPayload = ApiSupportedResponse;

export const fetchOnRampSupportedProviders = createAppAsyncThunk<FulfilledSupportedPayload, void>(
  'on-ramp/fetchSupported',
  async () => {
    const api = await getOnRampApi();
    return await api.getSupported();
  }
);

export type FulfilledQuotePayload = ApiQuoteResponse;

export const fetchOnRampQuote = createAppAsyncThunk<FulfilledQuotePayload, ApiQuoteRequest>(
  'on-ramp/fetchQuote',
  async options => {
    const api = await getOnRampApi();
    return await api.getQuote(options);
  }
);

export type FulfilledSetFiatPayload = {
  fiat: string;
  step: FormStep;
};

export const setOnRampFiat = createAppAsyncThunk<
  FulfilledSetFiatPayload,
  {
    fiat: string;
  }
>('on-ramp/setFiat', async (options, { getState }) => {
  const state = getState();
  const { fiat: newFiat } = options;
  const token = selectToken(state);
  const network = selectNetworkOrUndefined(state);

  if (
    state.ui.onRamp.lastStep === FormStep.InputAmount &&
    network &&
    selectIsFiatTokenNetworkSupported(state, newFiat, token, network)
  ) {
    return {
      step: FormStep.InputAmount,
      fiat: newFiat,
    };
  }

  return {
    step: FormStep.SelectToken,
    fiat: newFiat,
  };
});

export type FulfilledSetTokenPayload = {
  token: string;
  step: FormStep;
};

export const setOnRampToken = createAppAsyncThunk<
  FulfilledSetTokenPayload,
  {
    token: string;
  }
>('on-ramp/setToken', async (options, { getState }) => {
  const state = getState();
  const { token: newToken } = options;
  const fiat = selectFiat(state);
  const network = selectNetworkOrUndefined(state);

  if (
    state.ui.onRamp.lastStep === FormStep.InputAmount &&
    network &&
    selectIsFiatTokenNetworkSupported(state, fiat, newToken, network)
  ) {
    return {
      step: FormStep.InputAmount,
      token: newToken,
    };
  }

  return {
    step: FormStep.SelectNetwork,
    token: newToken,
  };
});

export type ValidateFulfilledPayload = {
  fiat: undefined | FiatError;
  token: undefined | TokenError;
  network: undefined | NetworkError;
  input: undefined | InputError;
};

export const validateOnRampForm = createAppAsyncThunk<ValidateFulfilledPayload, void>(
  'on-ramp/validateForm',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const errors: ValidateFulfilledPayload = {
      fiat: undefined,
      token: undefined,
      network: undefined,
      input: undefined,
    };
    const fiat = selectFiatOrUndefined(state);
    if (!fiat) {
      errors.fiat = FiatError.NotSelected;
      return errors;
    }

    if (!selectIsFiatSupported(state, fiat)) {
      errors.fiat = FiatError.NotSupported;
      return errors;
    }

    const token = selectTokenOrUndefined(state);
    if (!token) {
      errors.token = TokenError.NotSelected;
      return errors;
    }

    if (!selectIsFiatTokenSupported(state, fiat, token)) {
      errors.token = TokenError.NotSupported;
      return errors;
    }

    const network = selectNetworkOrUndefined(state);
    if (!network) {
      errors.network = NetworkError.NotSelected;
      return errors;
    }

    if (!selectIsFiatTokenNetworkSupported(state, fiat, token, network)) {
      errors.network = NetworkError.NotSupported;
      return errors;
    }

    const inputAmount = selectInputAmount(state);
    if (!inputAmount) {
      errors.input = InputError.NotEntered;
      return errors;
    }

    const inputMode = selectInputModeOrUndefined(state);
    if (inputMode === InputMode.Fiat) {
      const range = selectFiatTokenMinMaxFiat(state, fiat, token, network);
      console.log(range, inputAmount);
      if (inputAmount < range.min || inputAmount > range.max) {
        errors.input = InputError.OutOfRange;
        return errors;
      }
    } else {
      // no min/max token amount in API
    }

    const providers = selectProvidersForFiatTokenNetwork(state, fiat, token, network);

    dispatch(
      fetchOnRampQuote({
        amount: inputAmount,
        amountType: inputMode === InputMode.Fiat ? 'fiat' : 'crypto',
        network: network,
        cryptoCurrency: token,
        fiatCurrency: fiat,
        providers: providers,
      })
    );

    return errors;
  }
);
