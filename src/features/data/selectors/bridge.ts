import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectErc20TokenByAddress } from './tokens';
import { FormStep } from '../reducers/wallet/bridge';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../apis/config-types';
import {
  selectStepperCurrentStepData,
  selectStepperItems,
  selectStepperStepContent,
} from './stepper';
import { StepContent } from '../reducers/wallet/stepper';
import { createSelector } from '@reduxjs/toolkit';

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

export const selectBridgeDepositTokenForChainId = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  const address = state.ui.bridge.destinations.chainToAddress[chainId];
  if (!address) {
    throw new Error(`No bridge deposit token for chain ${chainId}`);
  }

  return selectErc20TokenByAddress(state, chainId, address);
};

export const selectBridgeXTokenForChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  const address = state.ui.bridge.tokens[chainId];
  if (!address) {
    throw new Error(`No bridge XERC20 token for chain ${chainId}`);
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
export const selectBridgeQuoteErrorLimits = (state: BeefyState) => {
  const error = selectBridgeQuoteError(state);
  if (error.name === 'AllQuotesRateLimitedError' && state.ui.bridge.quote.limitError) {
    return state.ui.bridge.quote.limitError;
  }

  return false;
};

export const selectBridgeQuoteIds = (state: BeefyState) => state.ui.bridge.quote.quotes.allIds;

export const selectBridgeQuoteById = (
  state: BeefyState,
  id: string
): IBridgeQuote<BeefyAnyBridgeConfig> => state.ui.bridge.quote.quotes.byId[id];

export const selectBridgeLimitedQuoteIds = (state: BeefyState) =>
  state.ui.bridge.quote.limitedQuotes.allIds;

export const selectBridgeLimitedQuoteById = (
  state: BeefyState,
  id: string
): IBridgeQuote<BeefyAnyBridgeConfig> => state.ui.bridge.quote.limitedQuotes.byId[id];

export const selectAllBridgeLimitedQuotes = createSelector(
  selectBridgeLimitedQuoteIds,
  (state: BeefyState) => state.ui.bridge.quote.limitedQuotes.byId,
  (ids, byId) => ids.map(id => byId[id])
);

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

export function selectBridgeTxState(state: BeefyState) {
  const items = selectStepperItems(state);
  if (!items.length) {
    return { step: 'unknown', status: 'unknown' };
  }

  const currentItem = selectStepperCurrentStepData(state);
  if (!currentItem) {
    return { step: 'unknown', status: 'unknown' };
  }

  if (currentItem.step !== 'approve' && currentItem.step !== 'bridge') {
    return { step: 'unknown', status: 'unknown' };
  }

  const stepContent = selectStepperStepContent(state);
  if (stepContent === StepContent.StartTx) {
    return { step: currentItem.step, status: 'pending' };
  } else if (stepContent === StepContent.WaitingTx) {
    return { step: currentItem.step, status: 'mining' };
  } else if (stepContent === StepContent.SuccessTx) {
    return { step: currentItem.step, status: 'success' };
  } else if (stepContent === StepContent.ErrorTx) {
    return { step: currentItem.step, status: 'error' };
  }

  return { step: 'unknown', status: 'unknown' };
}
