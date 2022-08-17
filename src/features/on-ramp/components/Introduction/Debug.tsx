import React, { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectCanQuote, selectHaveQuote } from '../../../data/selectors/on-ramp';

export const Debug = memo(function () {
  const quote = useAppSelector(state => state.ui.onRamp.quote);
  const canQuote = useAppSelector(selectCanQuote);
  const haveQuote = useAppSelector(selectHaveQuote);
  const country = useAppSelector(state => state.ui.onRamp.country.value);
  const countryError = useAppSelector(state => state.ui.onRamp.country.error);
  const fiat = useAppSelector(state => state.ui.onRamp.fiat.value);
  const fiatError = useAppSelector(state => state.ui.onRamp.fiat.error);
  const token = useAppSelector(state => state.ui.onRamp.token.value);
  const tokenError = useAppSelector(state => state.ui.onRamp.token.error);
  const network = useAppSelector(state => state.ui.onRamp.network.value);
  const networkError = useAppSelector(state => state.ui.onRamp.network.error);
  const input = useAppSelector(state => state.ui.onRamp.input.value);
  const inputError = useAppSelector(state => state.ui.onRamp.input.error);
  const inputMode = useAppSelector(state => state.ui.onRamp.input.mode);

  return (
    <div>
      <div>Debug</div>
      <div>country: {JSON.stringify(country)}</div>
      <div>countryError: {JSON.stringify(countryError)}</div>
      <div>fiat: {JSON.stringify(fiat)}</div>
      <div>fiatError: {JSON.stringify(fiatError)}</div>
      <div>token: {JSON.stringify(token)}</div>
      <div>tokenError: {JSON.stringify(tokenError)}</div>
      <div>network: {JSON.stringify(network)}</div>
      <div>networkError: {JSON.stringify(networkError)}</div>
      <div>input: {JSON.stringify(input)}</div>
      <div>inputError: {JSON.stringify(inputError)}</div>
      <div>inputMode: {JSON.stringify(inputMode)}</div>
      <div>canQuote: {JSON.stringify(canQuote, null, 2)}</div>
      <div>haveQuote: {JSON.stringify(haveQuote, null, 2)}</div>
      <div>
        quote: <div style={{ whiteSpace: 'pre' }}>{JSON.stringify(quote, null, 2)}</div>
      </div>
    </div>
  );
});
