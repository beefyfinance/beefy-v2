import { BalancerFeature, type IBalancerAllPool, type IBalancerSinglePool } from '../types.ts';

export function isBalancerSinglePool(
  pool: IBalancerSinglePool | IBalancerAllPool
): pool is IBalancerSinglePool {
  return (
    pool.supportsFeature(BalancerFeature.AddRemoveSingle) && 'quoteRemoveLiquidityOneToken' in pool
  );
}

export function isBalancerAllPool(
  pool: IBalancerSinglePool | IBalancerAllPool
): pool is IBalancerAllPool {
  return pool.supportsFeature(BalancerFeature.AddRemoveAll) && 'getSwapRatios' in pool;
}
