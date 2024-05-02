import type { ChainEntity } from '../../entities/chain';
import {
  type AmmEntitySolidly,
  type AmmEntityUniswapLike,
  type AmmEntityUniswapV2,
  isSolidlyAmm,
  isUniswapV2Amm,
} from '../../entities/zap';
import type { IUniswapLikePool } from './types';
import { UniswapV2Pool } from './uniswap-v2/UniswapV2Pool';
import { SolidlyPool } from './solidly/SolidlyPool';
import { MdexUniswapV2Pool } from './uniswap-v2/MdexUniswapV2Pool';
import { BiSwapUniswapV2Pool } from './uniswap-v2/BiSwapUniswapV2Pool';
import { ConeSolidlyPool } from './solidly/ConeSolidlyPool';
import { SwapsicleUniswapV2Pool } from './uniswap-v2/SwapsicleUniswapV2Pool';
import { MMFUniswapV2Pool } from './uniswap-v2/MMFUniswapV2Pool';
import { TombSwapUniswapV2Pool } from './uniswap-v2/TombSwapUniswapV2Pool';
import { SpiritSwapV2SolidlyPool } from './solidly/SpiritSwapV2SolidlyPool';
import { NetswapUniswapV2Pool } from './uniswap-v2/NetswapUniswapV2Pool';
import { StellaUniswapV2Pool } from './uniswap-v2/StellaUniswapV2Pool';
import { VelodromeSolidlyPool } from './solidly/VelodromeSolidlyPool';
import { EthereumSolidlyPool } from './solidly/EthereumSolidlyPool';
import { VelodromeV2SolidlyPool } from './solidly/VelodromeV2SolidlyPool';
import { BVMSolidlyPool } from './solidly/BVMSolidlyPool';

const mapUniswapV2 = {
  'avax-swapsicle': SwapsicleUniswapV2Pool,
  'bsc-mdex': MdexUniswapV2Pool,
  'bsc-biswap': BiSwapUniswapV2Pool,
  'cronos-mmf': MMFUniswapV2Pool,
  'fantom-tombswap': TombSwapUniswapV2Pool,
  'metis-netswap': NetswapUniswapV2Pool,
  'moonbeam-stella': StellaUniswapV2Pool,
} as const satisfies Record<string, typeof UniswapV2Pool>;

const mapSolidly = {
  'bsc-cone': ConeSolidlyPool,
  'arbitrum-solidlizard': ConeSolidlyPool,
  'fantom-spirit-v2': SpiritSwapV2SolidlyPool,
  'fantom-fvm': BVMSolidlyPool,
  'optimism-velodrome': VelodromeSolidlyPool,
  'linea-solidly-nile': VelodromeSolidlyPool,
  'fraxtal-ra': VelodromeSolidlyPool,
  'optimism-velodrome-v2': VelodromeV2SolidlyPool,
  'base-aerodrome': VelodromeV2SolidlyPool,
  'fantom-equalizer': VelodromeSolidlyPool,
  'canto-velocimeter': VelodromeSolidlyPool,
  'base-bvm': BVMSolidlyPool,
  'zksync-velocore': VelodromeSolidlyPool,
  'zksync-vesync': VelodromeSolidlyPool,
  'zksync-dracula': ConeSolidlyPool,
  'kava-equilibre': VelodromeSolidlyPool,
  'arbitrum-ramses': VelodromeSolidlyPool,
  'ethereum-solidly': EthereumSolidlyPool,
} as const satisfies Record<string, typeof SolidlyPool>;

export async function getUniswapLikePool(
  lpAddress: string,
  amm: AmmEntityUniswapV2,
  chain: ChainEntity
): Promise<UniswapV2Pool>;
export async function getUniswapLikePool(
  lpAddress: string,
  amm: AmmEntitySolidly,
  chain: ChainEntity
): Promise<SolidlyPool>;
export async function getUniswapLikePool(
  lpAddress: string,
  amm: AmmEntityUniswapLike,
  chain: ChainEntity
): Promise<IUniswapLikePool>;
export async function getUniswapLikePool(
  lpAddress: string,
  amm: AmmEntityUniswapLike,
  chain: ChainEntity
): Promise<IUniswapLikePool> {
  if (isUniswapV2Amm(amm)) {
    const Constructor: typeof UniswapV2Pool = mapUniswapV2[amm.id] || UniswapV2Pool;
    return await initUniswapLikePool(new Constructor(lpAddress, amm, chain));
  } else if (isSolidlyAmm(amm)) {
    const Constructor: typeof SolidlyPool = mapSolidly[amm.id] || SolidlyPool;
    return await initUniswapLikePool(new Constructor(lpAddress, amm, chain));
  } else {
    throw new Error(`Unknown AMM type`);
  }
}

async function initUniswapLikePool<T extends IUniswapLikePool>(pool: T): Promise<T> {
  await pool.updateAllData();
  return pool;
}
