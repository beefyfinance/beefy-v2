import { createSelector } from '@reduxjs/toolkit';
import { uniqBy } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import type { TFunction } from 'react-i18next';
import {
  featurableVaultSide,
  isValidZapFeeRule,
  matchFeaturedVaultCampaign,
} from '../apis/transact/helpers/fee-rules.ts';
import {
  isZapQuoteStepBridge,
  isZapQuoteStepSwap,
  type ZapQuoteStep,
} from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { AmmEntity, SwapAggregatorEntity } from '../entities/zap.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import { selectPlatformByIdOrUndefined } from './platforms.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';

export const selectZapByChainId = (state: BeefyState, chainId: ChainEntity['id']) =>
  state.entities.zaps.zaps.byChainId[chainId] || undefined;

export const selectZapFeeConfigByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  const zap = selectZapByChainId(state, chainId);
  if (!zap) {
    return undefined;
  }
  return { recipient: zap.feeRecipient, bps: zap.feeBps };
};

export const selectZapFeeRules = (state: BeefyState) => state.entities.zaps.feeCampaigns;

const warnedInvalidZapFeeRuleIds = new Set<string>();
const warnedNonFeaturableZapFeeRuleIds = new Set<string>();

export const selectValidZapFeeRules = createSelector([selectZapFeeRules], rules =>
  rules.filter(rule => {
    if (isValidZapFeeRule(rule)) {
      return true;
    }
    const id = typeof rule?.id === 'string' ? rule.id : 'unknown';
    if (!warnedInvalidZapFeeRuleIds.has(id)) {
      warnedInvalidZapFeeRuleIds.add(id);
      console.warn(`Ignoring invalid zap fee rule "${id}"`);
    }
    return false;
  })
);

export const selectFeaturedZapFeeRules = createSelector([selectValidZapFeeRules], rules =>
  rules.filter(rule => {
    if (!rule.featured) {
      return false;
    }
    if (featurableVaultSide(rule) !== undefined) {
      return true;
    }
    if (!warnedNonFeaturableZapFeeRuleIds.has(rule.id)) {
      warnedNonFeaturableZapFeeRuleIds.add(rule.id);
      console.warn(
        `Zap fee rule "${rule.id}" is flagged featured but isn't single-sided with a vault matcher; excluded from the vault list`
      );
    }
    return false;
  })
);

export type ZapVaultCampaign = {
  effectiveBps: number;
  baseBps: number;
  free: boolean;
  description?: string;
  id?: string;
};

export const selectZapCampaignByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => selectFeaturedZapFeeRules(state),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultByIdOrUndefined(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultByIdOrUndefined(state, vaultId);
    return vault ? selectZapByChainId(state, vault.chainId) : undefined;
  },
  () => Math.trunc(Date.now() / 600000), // re-evaluate campaign windows on a 10-min bucket
  (rules, vault, zap, _bucket): ZapVaultCampaign | undefined => {
    if (!vault || !zap?.feeRecipient) {
      return undefined;
    }
    const fee = matchFeaturedVaultCampaign(
      rules,
      { recipient: zap.feeRecipient, bps: zap.feeBps },
      vault,
      Math.floor(Date.now() / 1000)
    );
    if (!fee || fee.effectiveBps >= fee.baseBps) {
      return undefined;
    }
    return {
      effectiveBps: fee.effectiveBps,
      baseBps: fee.baseBps,
      free: fee.effectiveBps === 0,
      ...(fee.winner?.description ? { description: fee.winner.description } : {}),
      ...(fee.winner?.id ? { id: fee.winner.id } : {}),
    };
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectSwapAggregatorById = (state: BeefyState, id: SwapAggregatorEntity['id']) =>
  state.entities.zaps.aggregators.byId[id] || undefined;

export const selectSwapAggregatorsExistForChain = (state: BeefyState, chainId: ChainEntity['id']) =>
  (state.entities.zaps.aggregators.byChainId[chainId]?.allIds.length || 0) > 0;

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

export const selectSwapAggregatorForChainType = <T extends SwapAggregatorEntity['type']>(
  state: BeefyState,
  chainId: ChainEntity['id'],
  type: T
): Extract<
  SwapAggregatorEntity,
  {
    type: T;
  }
> => {
  const id = state.entities.zaps.aggregators.byChainId[chainId]?.byType[type];
  const entity = id ? state.entities.zaps.aggregators.byId[id] : undefined;
  return entity as Extract<
    SwapAggregatorEntity,
    {
      type: T;
    }
  >;
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

export const selectAmmsByChainId = (state: BeefyState, chainId: ChainEntity['id']) =>
  arrayOrStaticEmpty(state.entities.zaps.amms.byChainId[chainId]);

export const selectAmmById = createSelector(
  (_state: BeefyState, ammId: AmmEntity['id']) => ammId,
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

export type ZapQuoteProvider = {
  name: string;
  icon: string;
};

export const selectZapQuoteProviders = (
  state: BeefyState,
  steps: ZapQuoteStep[],
  t: TFunction
): ZapQuoteProvider[] => {
  const providers: ZapQuoteProvider[] = [];
  const seen = new Set<string>();

  const swapSteps = steps.filter(isZapQuoteStepSwap);
  const nonWraps = swapSteps.filter(step => step.providerId !== 'wnative');
  const uniqueSwapProviders = uniqBy(
    nonWraps.map(step => ({ providerId: step.providerId, via: step.via })),
    p => `${p.providerId}-${p.via}`
  );

  for (const p of uniqueSwapProviders) {
    const key = `${p.providerId}-${p.via}`;
    if (!seen.has(key)) {
      seen.add(key);
      providers.push({
        name: selectZapSwapProviderName(state, p.providerId, p.via, t),
        icon: p.via === 'aggregator' ? p.providerId : 'default',
      });
    }
  }

  const bridgeSteps = steps.filter(isZapQuoteStepBridge);
  for (const bridge of bridgeSteps) {
    const key = `bridge-${bridge.bridgeId}`;
    if (!seen.has(key)) {
      seen.add(key);
      providers.push({
        name: bridge.bridgeId.toUpperCase(),
        icon: bridge.bridgeId,
      });
    }
  }

  if (providers.length === 0) {
    providers.push({ name: t('Transact-Quote-Title'), icon: 'default' });
  }

  return providers;
};
