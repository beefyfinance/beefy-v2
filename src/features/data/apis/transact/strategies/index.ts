import type {
  IAnyStrategyStatic,
  IComposableStrategyStatic,
  IComposerStrategyStatic,
} from './IStrategy';
import type { OmitNever, PromiseReturnType } from '../../../utils/types-utils';
import type { ZapStrategyId } from './strategy-configs';

const strategyLoadersByIdUnchecked = {
  single: async () => (await import('./single/SingleStrategy')).SingleStrategy,
  'uniswap-v2': async () => (await import('./uniswap-v2/UniswapV2Strategy')).UniswapV2Strategy,
  solidly: async () => (await import('./solidly/SolidlyStrategy')).SolidlyStrategy,
  curve: async () => (await import('./curve/CurveStrategy')).CurveStrategy,
  gamma: async () => (await import('./gamma/GammaStrategy')).GammaStrategy,
  conic: async () => (await import('./conic/ConicStrategy')).ConicStrategy,
  'gov-composer': async () => (await import('./gov/GovComposerStrategy')).GovComposerStrategy,
  'vault-composer': async () =>
    (await import('./vault/VaultComposerStrategy')).VaultComposerStrategy,
  cowcentrated: async () =>
    (await import('./cowcentrated/CowcentratedStrategy')).CowcentratedStrategy,
  'reward-pool-to-vault': async () =>
    (await import('./RewardPoolToVaultStrategy')).RewardPoolToVaultStrategy,
} as const satisfies Record<ZapStrategyId, () => Promise<IAnyStrategyStatic>>;

type StrategyIdToStaticPromise = typeof strategyLoadersByIdUnchecked;

export type StrategyIdToStatic = OmitNever<{
  [K in keyof StrategyIdToStaticPromise]: PromiseReturnType<
    ReturnType<StrategyIdToStaticPromise[K]>
  >;
}>;

export type ComposableStrategyId = {
  [K in ZapStrategyId]: StrategyIdToStatic[K] extends IComposableStrategyStatic<K> ? K : never;
}[ZapStrategyId];

export type ComposerStrategyId = {
  [K in ZapStrategyId]: StrategyIdToStatic[K] extends IComposerStrategyStatic<K> ? K : never;
}[ZapStrategyId];

export type AnyZapStrategyStatic = StrategyIdToStatic[ZapStrategyId];
export type ComposableZapStrategyStatic = StrategyIdToStatic[ComposableStrategyId];
export type ComposerZapStrategyStatic = StrategyIdToStatic[ComposerStrategyId];
export type BasicZapStrategyStatic = Exclude<
  AnyZapStrategyStatic,
  ComposableZapStrategyStatic | ComposerZapStrategyStatic
>;

type StrategyIdToPromiseLoader = {
  [K in ZapStrategyId]: () => StrategyIdToStatic[K]['id'] extends K
    ? Promise<StrategyIdToStatic[K]>
    : never;
};

// ensure key->strategy mapping matches
export const strategyLoadersById = strategyLoadersByIdUnchecked satisfies StrategyIdToPromiseLoader;

export function isComposableStrategyStatic(
  strategy: AnyZapStrategyStatic
): strategy is ComposableZapStrategyStatic {
  return 'composable' in strategy && strategy.composable;
}

export function isComposerStrategyStatic(
  strategy: AnyZapStrategyStatic
): strategy is ComposerZapStrategyStatic {
  return 'composer' in strategy && strategy.composer;
}

export function isBasicZapStrategyStatic(
  strategy: AnyZapStrategyStatic
): strategy is BasicZapStrategyStatic {
  return !isComposableStrategyStatic(strategy) && !isComposerStrategyStatic(strategy);
}
