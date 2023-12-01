import type { UniswapV2Pool } from './uniswap-v2/UniswapV2Pool';
import type { IPool } from './types';

export function isUniswapV2Pool(pool: IPool): pool is UniswapV2Pool {
  return pool.type === 'uniswap-v2';
}
