import { createSelector } from '@reduxjs/toolkit';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types.ts';
import type { BeefyAnyBridgeConfig } from '../apis/config-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { FormStep } from '../reducers/wallet/bridge-types.ts';
import { StepContent } from '../reducers/wallet/stepper-types.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty, valueOrThrow } from '../utils/selector-utils.ts';
import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from './data-loader-helpers.ts';
import {
  selectStepperCurrentStepData,
  selectStepperItems,
  selectStepperStepContent,
} from './stepper.ts';
import { selectErc20TokenByAddress } from './tokens.ts';

export const selectIsBridgeConfigLoaded = createGlobalDataSelector(
  'bridgeConfig',
  hasLoaderFulfilledOnce
);

export const selectShouldLoadBridgeConfig = createGlobalDataSelector(
  'bridgeConfig',
  shouldLoaderLoadOnce
);

export const selectBridgeSupportedChainIds = (state: BeefyState) =>
  state.ui.bridge.destinations.allChains;

export const selectBridgeSupportedChainIdsFrom = (state: BeefyState, chainId: ChainEntity['id']) =>
  valueOrThrow(
    state.ui.bridge.destinations.chainToChain[chainId],
    `No destinations for ${chainId}`
  );

export const selectBridgeIdsFromTo = (
  state: BeefyState,
  from: ChainEntity['id'],
  to: ChainEntity['id']
) => arrayOrStaticEmpty(state.ui.bridge.destinations.chainToBridges[from]?.[to]);

export const selectBridgeConfigById = (state: BeefyState, id: BeefyAnyBridgeConfig['id']) => {
  const bridges = state.ui.bridge.bridges;
  if (!bridges) {
    throw new Error('Bridge config not loaded');
  }
  const bridge = bridges[id];
  if (!bridge) {
    throw new Error(`No bridge config for id ${id}`);
  }
  return bridge;
};

export const selectBridgeSourceToken = (state: BeefyState) => {
  const source = state.ui.bridge.source;
  if (!source) {
    throw new Error('Bridge config not loaded');
  }
  return source;
};

export const selectBridgeSourceChainId = (state: BeefyState) => {
  return selectBridgeSourceToken(state).chainId;
};

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
  const form = state.ui.bridge.form;
  if (!form) {
    throw new Error('Bridge form not loaded');
  }

  if (selectBridgeFormStep(state) === FormStep.Loading) {
    throw new Error('Bridge form is loading');
  }

  return form;
};

export const selectBridgeQuoteStatus = (state: BeefyState) => state.ui.bridge.quote.status;

export const selectBridgeQuoteError = (state: BeefyState) => state.ui.bridge.quote.error;
export const selectBridgeQuoteErrorLimits = (state: BeefyState) => {
  const error = selectBridgeQuoteError(state);
  if (!error) {
    return false;
  }

  if (error.name === 'AllQuotesRateLimitedError' && state.ui.bridge.quote.limitError) {
    return state.ui.bridge.quote.limitError;
  }

  return false;
};

export const selectBridgeQuoteIds = (state: BeefyState) => state.ui.bridge.quote.quotes.allIds;

export const selectBridgeQuoteById = (
  state: BeefyState,
  id: BeefyAnyBridgeConfig['id']
): IBridgeQuote<BeefyAnyBridgeConfig> =>
  valueOrThrow(state.ui.bridge.quote.quotes.byId[id], `No bridge quote for ${id}`);

export const selectBridgeLimitedQuoteIds = (state: BeefyState) =>
  state.ui.bridge.quote.limitedQuotes.allIds;

export const selectBridgeLimitedQuoteById = (
  state: BeefyState,
  id: BeefyAnyBridgeConfig['id']
): IBridgeQuote<BeefyAnyBridgeConfig> =>
  valueOrThrow(state.ui.bridge.quote.limitedQuotes.byId[id], `No bridge limited quote for ${id}`);

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
export const selectBridgeConfirmQuote = (state: BeefyState) =>
  valueOrThrow(state.ui.bridge.confirm.quote, 'No bridge quote');

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
    return { step: currentItem.step, status: 'building' };
  } else if (stepContent === StepContent.WalletTx) {
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
