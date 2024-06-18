import type {
  IStrategy,
  StrategyConstructor,
  StrategyOptions,
  ZapTransactHelpers,
} from './IStrategy';
import type { BeefyState } from '../../../../../redux-types';

function makeLazyLoader<T extends StrategyConstructor>(loader: () => Promise<T>) {
  let constructor: T | undefined;

  return async (options: StrategyOptions, helpers: ZapTransactHelpers) => {
    if (!constructor) {
      constructor = await loader();
    }

    return new constructor(options, helpers);
  };
}

export const strategyBuildersById = {
  single: makeLazyLoader(async () => (await import('./single/SingleStrategy')).SingleStrategy),
  'uniswap-v2': makeLazyLoader(
    async () => (await import('./uniswap-v2/UniswapV2Strategy')).UniswapV2Strategy
  ),
  solidly: makeLazyLoader(async () => (await import('./solidly/SolidlyStrategy')).SolidlyStrategy),
  curve: makeLazyLoader(async () => (await import('./curve/CurveStrategy')).CurveStrategy),
  gamma: makeLazyLoader(async () => (await import('./gamma/GammaStrategy')).GammaStrategy),
  conic: makeLazyLoader(async () => (await import('./conic/ConicStrategy')).ConicStrategy),
  gov: makeLazyLoader(
    async () => (await import('./gov/GovUnderlyingStrategy')).GovUnderlyingStrategy
  ),
  cowcentrated: makeLazyLoader(
    async () => (await import('./cowcentrated/CowcentratedStrategy')).CowcentratedStrategy
  ),
} as const satisfies Record<
  StrategyOptions['strategyId'],
  (options: StrategyOptions, helpers: ZapTransactHelpers, state: BeefyState) => Promise<IStrategy>
>;
