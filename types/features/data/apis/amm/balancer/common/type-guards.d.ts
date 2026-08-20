import { type IBalancerAllPool, type IBalancerSinglePool } from '../types';
export declare function isBalancerSinglePool(pool: IBalancerSinglePool | IBalancerAllPool): pool is IBalancerSinglePool;
export declare function isBalancerAllPool(pool: IBalancerSinglePool | IBalancerAllPool): pool is IBalancerAllPool;
