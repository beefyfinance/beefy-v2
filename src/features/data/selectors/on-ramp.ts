import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { InputMode } from '../reducers/on-ramp-types';
import { isInitialLoader } from '../reducers/data-loader-types';
import { orderBy } from 'lodash';
import { singleAssetExists } from '../../../helpers/singleAssetSrc';

export const selectIsOnRampLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.onRamp.alreadyLoadedOnce;

export const selectShouldInitOnRamp = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.onRamp);

export const selectToken = (state: BeefyState) => state.ui.onRamp.token.value;
export const selectTokenError = (state: BeefyState) => state.ui.onRamp.token.error;
export const selectFiat = (state: BeefyState) => state.ui.onRamp.fiat.value;
export const selectFiatError = (state: BeefyState) => state.ui.onRamp.fiat.error;
export const selectNetwork = (state: BeefyState) => state.ui.onRamp.network.value;
export const selectNetworkError = (state: BeefyState) => state.ui.onRamp.network.error;
export const selectInputAmount = (state: BeefyState) => state.ui.onRamp.input.value;
export const selectInputMode = (state: BeefyState) => state.ui.onRamp.input.mode;
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
        appChainIds.find(chainId => token in appTokensByChainId[chainId].byId) !== undefined &&
        singleAssetExists(token)
    )
);

// Checks that {token} exists for {fiat}
export const selectIsFiatTokenSupported = (state: BeefyState, fiat: string, token: string) =>
  selectIsFiatSupported(state, fiat) && token in state.ui.onRamp.byFiat[fiat].byToken;

// All {network}s that exist for {token}
export const selectNetworksForFiatToken = createSelector(
  (state: BeefyState, fiat: string, token: string) => state.entities.chains.allIds,
  (state: BeefyState, fiat: string, token: string) =>
    selectIsFiatTokenSupported(state, fiat, token)
      ? state.ui.onRamp.byFiat[fiat].byToken[token].allNetworks
      : [],
  (fiatTokenNetworks, appChains) => fiatTokenNetworks.filter(network => appChains.includes(network))
);

export const selectIsFiatTokenNetworkSupported = createSelector(
  (state: BeefyState, fiat: string, token: string, network: string) =>
    selectNetworksForFiatToken(state, fiat, token),
  (state: BeefyState, fiat: string, token: string, network: string) => network,
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

export const selectSelectedQuote = createSelector(
  (state: BeefyState) => selectHaveQuote(state),
  (state: BeefyState) => state.ui.onRamp.quote.byProvider,
  (state: BeefyState) => state.ui.onRamp.quote.provider,
  (valid, byProvider, provider) => (valid ? byProvider[provider] : null)
);

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
  (state: BeefyState, provider: string) => provider,
  (state: BeefyState) => state.ui.onRamp.quote.byProvider,
  (provider, byProvider) => byProvider[provider]
);

export const selectQuoteError = createSelector(
  (state: BeefyState) => state.ui.onRamp.quote.status,
  (state: BeefyState) => state.ui.onRamp.quote.error,
  (status, error) => (status ? error : null)
);

export const selectOutputAmount = createSelector(
  (state: BeefyState) => selectSelectedQuote(state),
  (state: BeefyState) => selectInputMode(state),
  (quote, mode) => (quote ? (mode === InputMode.Fiat ? quote.tokenAmount : quote.fiatAmount) : 0)
);

export const selectIsCheapestProviderSelected = createSelector(
  (state: BeefyState) => state.ui.onRamp.quote.cheapestProvider,
  (state: BeefyState) => state.ui.onRamp.quote.provider,
  (cheapestProvider, selectedProvider) => cheapestProvider === selectedProvider
);

export const selectFiatTokenMinMaxFiat = createSelector(
  (state: BeefyState, fiat: string, token: string) => fiat,
  (state: BeefyState, fiat: string, token: string) => token,
  (state: BeefyState) => state.ui.onRamp.byFiat,
  (fiat, token, byFiat) => ({
    min: byFiat[fiat].byToken[token].minFiat,
    max: byFiat[fiat].byToken[token].maxFiat,
  })
);
