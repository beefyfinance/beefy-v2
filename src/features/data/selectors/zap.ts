import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import { createSelector } from '@reduxjs/toolkit';
import type { AmmEntity, SwapAggregatorEntity } from '../entities/zap';
import type { TokenEntity } from '../entities/token';
import type { VaultEntity } from '../entities/vault';
import { selectPlatformByIdOrUndefined } from './platforms';
import type { TFunction } from 'react-i18next';
import { isZapQuoteStepSwap, type ZapQuoteStep } from '../apis/transact/transact-types';
import { uniqBy } from 'lodash-es';

export const selectZapByChainId = (state: BeefyState, chainId: ChainEntity['id']) =>
  state.entities.zaps.zaps.byChainId[chainId] || undefined;

export const selectSwapAggregatorById = (state: BeefyState, id: SwapAggregatorEntity['id']) =>
  state.entities.zaps.aggregators.byId[id] || undefined;

export const selectSwapAggregatorsForChain = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.zaps.aggregators.byChainId[chainId]?.byType,
  (state: BeefyState) => state.entities.zaps.aggregators.byId,
  (byType, byId): SwapAggregatorEntity[] => {
    if (!byType) {
      return [];
    }

    return Object.values(byType).map(id => byId[id]);
  }
);

export const selectOneInchSwapAggregatorForChain = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  return selectSwapAggregatorForChainType(state, chainId, 'one-inch');
};

export const selectSwapAggregatorForChainType = <T extends SwapAggregatorEntity['type']>(
  state: BeefyState,
  chainId: ChainEntity['id'],
  type: T
): Extract<SwapAggregatorEntity, { type: T }> => {
  const id = state.entities.zaps.aggregators.byChainId[chainId]?.byType[type];
  const entity = id ? state.entities.zaps.aggregators.byId[id] : undefined;
  return entity as Extract<SwapAggregatorEntity, { type: T }>;
};

export const selectZapTokenScoresByChainId = (
  state: BeefyState,
  chainId: ChainEntity['id']
): Record<TokenEntity['id'], number> =>
  state.entities.zaps.tokens.byChainId[chainId]?.scoreById || {};

export const selectZapTokenScore = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
): number => state.entities.zaps.tokens.byChainId[chainId]?.scoreById[tokenId] || 0;

export const selectVaultSupportsZap = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.entities.zaps.vaults.byId[vaultId] || false;

export const selectAmmsByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, _chainId: ChainEntity['id']) => state.entities.zaps.amms.byChainId,
  (chainId, byChainId) => byChainId[chainId] || []
);

export const selectAmmById = createSelector(
  (state: BeefyState, ammId: AmmEntity['id']) => ammId,
  (state: BeefyState, _ammId: AmmEntity['id']) => state.entities.zaps.amms.byId,
  (ammId, byId) => byId[ammId] || null
);

export const selectZapSwapProviderName = (
  state: BeefyState,
  providerId: string,
  type: 'pool' | 'aggregator',
  t: TFunction
) => {
  if (type === 'pool') {
    const platform = selectPlatformByIdOrUndefined(state, providerId);
    return platform?.name || providerId;
  }

  if (type === 'aggregator') {
    return t(`Transact-SwapProvider-${providerId}`);
  }

  return providerId;
};

export const selectZapQuoteTitle = (state: BeefyState, steps: ZapQuoteStep[], t: TFunction) => {
  const defaultTitle = `Transact-Quote-Title`;
  const swapSteps = steps.filter(isZapQuoteStepSwap);
  if (swapSteps.length === 0) {
    return { title: defaultTitle, icon: 'default' };
  }

  const nonWraps = swapSteps.filter(step => step.providerId !== 'wnative');
  if (nonWraps.length === 0) {
    return { title: defaultTitle, icon: 'default' };
  }

  const uniqueProviders = uniqBy(
    nonWraps.map(step => ({
      providerId: step.providerId,
      via: step.via,
    })),
    p => `${p.providerId}-${p.via}`
  );

  const names = uniqueProviders.map(p => selectZapSwapProviderName(state, p.providerId, p.via, t));

  if (names.length === 1) {
    return {
      title: t(`Transact-Quote-Title-one`, { one: names[0] }),
      icon: uniqueProviders[0].via === 'aggregator' ? uniqueProviders[0].providerId : 'default',
    };
  } else if (names.length === 2) {
    return {
      title: t(`Transact-Quote-Title-two`, { one: names[0], two: names[1] }),
      icon: 'default',
    };
  } else {
    return {
      title: t(`Transact-Quote-Title-three`, { one: names[0], two: names[1], three: names[2] }),
      icon: 'default',
    };
  }
};
