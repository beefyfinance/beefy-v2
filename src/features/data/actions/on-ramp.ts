import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getOnRampApi } from '../apis/instances';
import {
  ApiQuoteRequest,
  ApiQuoteResponse,
  ApiSupportedResponse,
} from '../apis/on-ramp/on-ramp-types';
import {
  FiatError,
  InputError,
  InputMode,
  NetworkError,
  TokenError,
} from '../reducers/on-ramp-types';
import {
  selectFiatTokenMinMaxFiat,
  selectInputAmount,
  selectInputMode,
  selectIsFiatSupported,
  selectIsFiatTokenNetworkSupported,
  selectIsFiatTokenSupported,
  selectFiat,
  selectNetwork,
  selectToken,
  selectProvidersForFiatTokenNetwork,
} from '../selectors/on-ramp';

export type FulfilledSupportedPayload = ApiSupportedResponse;

export const fetchOnRampSupportedProviders = createAsyncThunk<
  FulfilledSupportedPayload,
  void,
  { state: BeefyState }
>('on-ramp/fetchSupported', async (_, { getState }) => {
  const api = await getOnRampApi();
  return await api.getSupported();
});

export type FulfilledQuotePayload = ApiQuoteResponse;

export const fetchOnRampQuote = createAsyncThunk<
  FulfilledQuotePayload,
  ApiQuoteRequest,
  { state: BeefyState }
>('on-ramp/fetchQuote', async (options, { getState }) => {
  const api = await getOnRampApi();
  return await api.getQuote(options);
});

export type ValidateFulfilledPayload = {
  fiat: null | FiatError;
  token: null | TokenError;
  network: null | NetworkError;
  input: null | InputError;
};

export const validateOnRampForm = createAsyncThunk<
  ValidateFulfilledPayload,
  void,
  { state: BeefyState }
>('on-ramp/validateForm', async (_, { getState, dispatch }) => {
  const state = getState();
  const errors = {
    fiat: null,
    token: null,
    network: null,
    input: null,
  };
  const fiat = selectFiat(state);
  if (!fiat) {
    errors.fiat = FiatError.NotSelected;
    return errors;
  }

  if (!selectIsFiatSupported(state, fiat)) {
    errors.fiat = FiatError.NotSupported;
    return errors;
  }

  const token = selectToken(state);
  if (!token) {
    errors.token = TokenError.NotSelected;
    return errors;
  }

  if (!selectIsFiatTokenSupported(state, fiat, token)) {
    errors.token = TokenError.NotSupported;
    return errors;
  }

  const network = selectNetwork(state);
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

  const inputMode = selectInputMode(state);
  if (inputMode === InputMode.Fiat) {
    const range = selectFiatTokenMinMaxFiat(state, fiat, token);
    if (inputAmount < range.min || inputAmount > range.max) {
      errors.input = InputError.OutOfRange;
      return errors;
    }
  } else {
    // TODO: min token amount?
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
});
