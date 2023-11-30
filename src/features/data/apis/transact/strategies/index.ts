import type { IStrategy, StrategyConstructor, StrategyOptions, TransactHelpers } from './IStrategy';
import type { BeefyState } from '../../../../../redux-types';

function makeLazyLoader<T extends StrategyConstructor>(loader: () => Promise<T>) {
  let constructor: T | undefined;

  return async (options: StrategyOptions, helpers: TransactHelpers) => {
    if (!constructor) {
      constructor = await loader();
    }

    const instance = new constructor(options, helpers);
    await instance.initialize();
    return instance;
  };
}

export const strategyBuildersById = {
  single: makeLazyLoader(async () => (await import('./single/SingleStrategy')).SingleStrategy),
  'uniswap-v2': makeLazyLoader(
    async () => (await import('./uniswap-v2/UniswapV2Strategy')).UniswapV2Strategy
  ),
  solidly: makeLazyLoader(async () => (await import('./solidly/SolidlyStrategy')).SolidlyStrategy),
  // 'solidly': SolidlyStrategy,
  // conic
} as const satisfies Record<
  StrategyOptions['strategyId'],
  (options: StrategyOptions, helpers: TransactHelpers, state: BeefyState) => Promise<IStrategy>
>;
