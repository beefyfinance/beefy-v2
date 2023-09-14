import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectErc20TokenByAddress } from './tokens';
import { FormStep } from '../reducers/wallet/bridge';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../apis/config-types';

export const selectIsBridgeConfigLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.bridgeConfig.alreadyLoadedOnce;

export const selectShouldLoadBridgeConfig = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.bridgeConfig);

export const selectBridgeSupportedChainIds = (state: BeefyState) =>
  state.ui.bridge.destinations.allChains;

export const selectBridgeSupportedChainIdsFrom = (state: BeefyState, chainId: ChainEntity['id']) =>
  state.ui.bridge.destinations.chainToChain[chainId];

export const selectBridgeIdsFromTo = (
  state: BeefyState,
  from: ChainEntity['id'],
  to: ChainEntity['id']
) => state.ui.bridge.destinations.chainToBridges[from]?.[to] || [];

export const selectBridgeConfigById = (state: BeefyState, id: BeefyAnyBridgeConfig['id']) =>
  state.ui.bridge.bridges[id];

export const selectBridgeSourceChainId = (state: BeefyState) => state.ui.bridge.source;

export const selectBridgeSourceToken = (state: BeefyState) =>
  selectBridgeTokenForChainId(state, selectBridgeSourceChainId(state));

export const selectBridgeTokenForChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  const address = state.ui.bridge.destinations.chainToAddress[chainId];
  if (!address) {
    throw new Error(`No bridge token for chain ${chainId}`);
  }

  return selectErc20TokenByAddress(state, chainId, address);
};

export const selectBridgeFormStep = (state: BeefyState) =>
  state.ui.bridge.form?.step || FormStep.Loading;

export const selectBridgeFormState = (state: BeefyState) => {
  if (selectBridgeFormStep(state) === FormStep.Loading) {
    throw new Error('Bridge form is loading');
  }

  return state.ui.bridge.form;
};

export const selectBridgeQuoteStatus = (state: BeefyState) => state.ui.bridge.quote.status;

export const selectBridgeQuoteError = (state: BeefyState) => state.ui.bridge.quote.error;

export const selectBridgeQuoteIds = (state: BeefyState) => state.ui.bridge.quote.quotes.allIds;

export const selectBridgeQuoteById = (
  state: BeefyState,
  id: string
): IBridgeQuote<BeefyAnyBridgeConfig> => state.ui.bridge.quote.quotes.byId[id];

export const selectBridgeQuoteSelectedId = (state: BeefyState) => state.ui.bridge.quote.selected;

export const selectBridgeHasSelectedQuote = (state: BeefyState) => {
  const status = selectBridgeQuoteStatus(state);
  if (status !== 'fulfilled') {
    return false;
  }
  const selectedId = selectBridgeQuoteSelectedId(state);
  return !!selectedId && selectedId in state.ui.bridge.quote.quotes.byId;
};

export const selectBridgeConfirmStatus = (state: BeefyState) => state.ui.bridge.confirm.status;
export const selectBridgeConfirmQuote = (state: BeefyState) => state.ui.bridge.confirm.quote;

export function selectBridgeState() {
  //
}

export function selectBridgeStatus() {
  //
}

export function selectBridgeTxData() {
  //
}

export function selectBifiAddress() {
  //
}

export function selectBridgeBifiDestChainData() {
  //
}
