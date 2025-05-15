import type {
  IAnyStrategyStatic,
  IComposableStrategyStatic,
  IComposerStrategyStatic,
} from './IStrategy.ts';
import type { OmitNever, PromiseReturnType } from '../../../utils/types-utils.ts';
import type { ZapStrategyId } from './strategy-configs.ts';

type AnyLoader = {
  [K in ZapStrategyId]: () => Promise<IAnyStrategyStatic<K>>;
}[ZapStrategyId];

const strategyLoadersByIdUnchecked = {
  single: async () => (await import('./single/SingleStrategy.ts')).SingleStrategy,
  'uniswap-v2': async () => (await import('./uniswap-v2/UniswapV2Strategy.ts')).UniswapV2Strategy,
  solidly: async () => (await import('./solidly/SolidlyStrategy.ts')).SolidlyStrategy,
  curve: async () => (await import('./curve/CurveStrategy.ts')).CurveStrategy,
  gamma: async () => (await import('./gamma/GammaStrategy.ts')).GammaStrategy,
  conic: async () => (await import('./conic/ConicStrategy.ts')).ConicStrategy,
  'gov-composer': async () => (await import('./gov/GovComposerStrategy.ts')).GovComposerStrategy,
  'vault-composer': async () =>
    (await import('./vault/VaultComposerStrategy.ts')).VaultComposerStrategy,
  cowcentrated: async () =>
    (await import('./cowcentrated/CowcentratedStrategy.ts')).CowcentratedStrategy,
  'reward-pool-to-vault': async () =>
    (await import('./RewardPoolToVaultStrategy.ts')).RewardPoolToVaultStrategy,
  balancer: async () => (await import('./balancer/BalancerStrategy.ts')).BalancerStrategy,
} as const satisfies Record<ZapStrategyId, AnyLoader>;

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
  [K in ZapStrategyId]: () => StrategyIdToStatic[K]['id'] extends K ? Promise<StrategyIdToStatic[K]>
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
