import type { ChainEntity } from '../../entities/chain';
import { type AmmEntitySolidly, type AmmEntityUniswapLike, type AmmEntityUniswapV2 } from '../../entities/zap';
import type { IUniswapLikePool } from './types';
import { UniswapV2Pool } from './uniswap-v2/UniswapV2Pool';
import { SolidlyPool } from './solidly/SolidlyPool';
export declare function getUniswapLikePool(lpAddress: string, amm: AmmEntityUniswapV2, chain: ChainEntity): Promise<UniswapV2Pool>;
export declare function getUniswapLikePool(lpAddress: string, amm: AmmEntitySolidly, chain: ChainEntity): Promise<SolidlyPool>;
export declare function getUniswapLikePool(lpAddress: string, amm: AmmEntityUniswapLike, chain: ChainEntity): Promise<IUniswapLikePool>;
