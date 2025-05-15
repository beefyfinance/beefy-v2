import { createSelector } from '@reduxjs/toolkit';
import { orderBy } from 'lodash-es';

import type { ChainEntity } from '../entities/chain.ts';
import { InputMode } from '../reducers/on-ramp-types.ts';
import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';
import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
} from './data-loader-helpers.ts';

export const selectIsOnRampLoaded = createGlobalDataSelector('onRamp', hasLoaderFulfilledOnce);

export const selectShouldInitOnRamp = (state: BeefyState) =>
  isLoaderIdle(state.ui.dataLoader.global.onRamp);

export const selectToken = (state: BeefyState) =>
  valueOrThrow(state.ui.onRamp.token.value, 'Token value is not set');
export const selectTokenOrUndefined = (state: BeefyState) => state.ui.onRamp.token.value;
export const selectTokenError = (state: BeefyState) => state.ui.onRamp.token.error;
export const selectFiat = (state: BeefyState) =>
  valueOrThrow(state.ui.onRamp.fiat.value, 'Fiat value is not set');
export const selectFiatOrUndefined = (state: BeefyState) => state.ui.onRamp.fiat.value;
export const selectFiatError = (state: BeefyState) => state.ui.onRamp.fiat.error;
export const selectNetwork = (state: BeefyState) =>
  valueOrThrow(state.ui.onRamp.network.value, 'Network value is not set');
export const selectNetworkOrUndefined = (state: BeefyState) => state.ui.onRamp.network.value;
export const selectNetworkError = (state: BeefyState) => state.ui.onRamp.network.error;
export const selectInputAmount = (state: BeefyState) => state.ui.onRamp.input.value;
export const selectInputMode = (state: BeefyState) =>
  valueOrThrow(state.ui.onRamp.input.mode, 'Input mode is not set');
export const selectInputModeOrUndefined = (state: BeefyState) => state.ui.onRamp.input.mode;
export const selectInputError = (state: BeefyState) => state.ui.onRamp.input.error;
export const selectCanQuote = (state: BeefyState) => state.ui.onRamp.canQuote;
export const selectAllFiat = (state: BeefyState) => state.ui.onRamp.allFiat;
export const selectStep = (state: BeefyState) => state.ui.onRamp.step;
export const selectLastStep = (state: BeefyState) => state.ui.onRamp.lastStep;

// {fiat} exists and has at least 1 supported {token}
export const selectIsFiatSupported = (state: BeefyState, fiat: string) =>
  fiat in state.ui.onRamp.byFiat && selectSupportedTokensForFiat(state, fiat).length > 0;

// All {token}s that exist for {fiat} that have at least 1 known {network}
export const selectSupportedTokensForFiat = createSelector(
  (state: BeefyState, fiat: string) => state.ui.onRamp.byFiat[fiat].allTokens,
  (state: BeefyState, fiat: string) => state.ui.onRamp.byFiat[fiat].byToken,
  (state: BeefyState) => state.entities.tokens.byChainId,
  (state: BeefyState) => state.entities.chains.allIds,
  (allTokens, byToken, appTokensByChainId, appChainIds) =>
    allTokens.filter(
      token =>
        byToken[token].allNetworks.find(network => appChainIds.includes(network)) !== undefined &&
        appChainIds.find(
          chainId =>
            // token exists
            token in appTokensByChainId[chainId]!.byId &&
            // token is used in an active vault
            (appTokensByChainId[chainId]!.tokenIdsInActiveVaults.includes(token) ||
              appTokensByChainId[chainId]!.wnative === token ||
              appTokensByChainId[chainId]!.native === token)
        ) !== undefined
    )
);

// Checks that {token} exists for {fiat}
export const selectIsFiatTokenSupported = (state: BeefyState, fiat: string, token: string) =>
  selectIsFiatSupported(state, fiat) && token in state.ui.onRamp.byFiat[fiat].byToken;

// All {network}s that exist for {token}
export const selectNetworksForFiatToken = createSelector(
  (state: BeefyState) => state.entities.chains.allIds,
  (state: BeefyState, fiat: string, token: string) =>
    selectIsFiatTokenSupported(state, fiat, token) ?
      state.ui.onRamp.byFiat[fiat].byToken[token].allNetworks
    : [],
  (fiatTokenNetworks, appChains) => fiatTokenNetworks.filter(network => appChains.includes(network))
);

export const selectIsFiatTokenNetworkSupported = createSelector(
  (state: BeefyState, fiat: string, token: string) =>
    selectNetworksForFiatToken(state, fiat, token),
  (_state: BeefyState, _fiat: string, _token: string, network: ChainEntity['id']) => network,
  (networksForFiatToken, network) => networksForFiatToken.includes(network)
);

export const selectProvidersForFiatTokenNetwork = (
  state: BeefyState,
  fiat: string,
  token: string,
  network: string
) => state.ui.onRamp.byFiat[fiat]?.byToken[token]?.byNetwork[network]?.allProviders;

export const selectQuoteStatus = (state: BeefyState) => state.ui.onRamp.quote.status;

export const selectHaveQuote = createSelector(
  (state: BeefyState) => state.ui.onRamp.quote.status,
  (state: BeefyState) => state.ui.onRamp.quote.providers,
  (state: BeefyState) => state.ui.onRamp.quote.provider,
  (state: BeefyState) => state.ui.onRamp.quote.byProvider,
  (status, providers, provider, byProvider) =>
    status === 'fulfilled' && providers.length && provider && provider in byProvider
);

export const selectSelectedQuoteOrUndefined = createSelector(
  (state: BeefyState) => selectHaveQuote(state),
  (state: BeefyState) => state.ui.onRamp.quote.byProvider,
  (state: BeefyState) => state.ui.onRamp.quote.provider,
  (valid, byProvider, provider) => (valid && provider ? byProvider[provider] : undefined)
);

export const selectSelectedQuote = (state: BeefyState) => {
  const quote = selectSelectedQuoteOrUndefined(state);
  return valueOrThrow(quote, 'Selected quote is not set');
};

export const selectQuoteProviders = createSelector(
  (state: BeefyState) => state.ui.onRamp.quote.providers,
  providers => providers ?? []
);

export const selectSortedQuoteProviders = createSelector(
  (state: BeefyState) => selectQuoteProviders(state),
  (state: BeefyState) => state.ui.onRamp.quote.byProvider,
  (providers, byProvider) => orderBy(providers, provider => byProvider[provider].rate, 'desc')
);

export const selectQuoteByProvider = createSelector(
  (_state: BeefyState, provider: string) => provider,
  (state: BeefyState) => state.ui.onRamp.quote.byProvider,
  (provider, byProvider) => byProvider[provider]
);

export const selectQuoteError = (state: BeefyState) =>
  valueOrThrow(state.ui.onRamp.quote.error, 'Quote error is not set');

export const selectOutputAmount = createSelector(
  (state: BeefyState) => selectSelectedQuoteOrUndefined(state),
  (state: BeefyState) => selectInputMode(state),
  (quote, mode) =>
    quote ?
      mode === InputMode.Fiat ?
        quote.tokenAmount
      : quote.fiatAmount
    : 0
);

export const selectIsCheapestProviderSelected = createSelector(
  (state: BeefyState) => state.ui.onRamp.quote.cheapestProvider,
  (state: BeefyState) => state.ui.onRamp.quote.provider,
  (cheapestProvider, selectedProvider) => cheapestProvider === selectedProvider
);

export const selectFiatTokenMinMaxFiat = createSelector(
  (_state: BeefyState, fiat: string) => fiat,
  (_state: BeefyState, _fiat: string, token: string) => token,
  (_state: BeefyState, _fiat: string, _token: string, network: string) => network,
  (state: BeefyState) => state.ui.onRamp.byFiat,
  (fiat, token, network, byFiat) => ({
    min: byFiat[fiat].byToken[token].byNetwork[network].minFiat,
    max: byFiat[fiat].byToken[token].byNetwork[network].maxFiat,
  })
);
