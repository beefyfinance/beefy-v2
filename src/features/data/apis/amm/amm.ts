import type { ChainEntity } from '../../entities/chain.ts';
import {
  type AmmEntitySolidly,
  type AmmEntityUniswapLike,
  type AmmEntityUniswapV2,
  isSolidlyAmm,
  isUniswapV2Amm,
} from '../../entities/zap.ts';
import type { IUniswapLikePool } from './types.ts';
import { UniswapV2Pool } from './uniswap-v2/UniswapV2Pool.ts';
import { SolidlyPool } from './solidly/SolidlyPool.ts';
import { MdexUniswapV2Pool } from './uniswap-v2/MdexUniswapV2Pool.ts';
import { BiSwapUniswapV2Pool } from './uniswap-v2/BiSwapUniswapV2Pool.ts';
import { ConeSolidlyPool } from './solidly/ConeSolidlyPool.ts';
import { SwapsicleUniswapV2Pool } from './uniswap-v2/SwapsicleUniswapV2Pool.ts';
import { MMFUniswapV2Pool } from './uniswap-v2/MMFUniswapV2Pool.ts';
import { TombSwapUniswapV2Pool } from './uniswap-v2/TombSwapUniswapV2Pool.ts';
import { SpiritSwapV2SolidlyPool } from './solidly/SpiritSwapV2SolidlyPool.ts';
import { NetswapUniswapV2Pool } from './uniswap-v2/NetswapUniswapV2Pool.ts';
import { StellaUniswapV2Pool } from './uniswap-v2/StellaUniswapV2Pool.ts';
import { VelodromeSolidlyPool } from './solidly/VelodromeSolidlyPool.ts';
import { EthereumSolidlyPool } from './solidly/EthereumSolidlyPool.ts';
import { VelodromeV2SolidlyPool } from './solidly/VelodromeV2SolidlyPool.ts';
import { BVMSolidlyPool } from './solidly/BVMSolidlyPool.ts';
import { VelodromeV2ModeSolidlyPool } from './solidly/VelodromeV2ModeSolidlyPool.ts';
import { TokanSolidlyPool } from './solidly/TokanSolidlyPool.ts';
import { DefiveUniswapV2Pool } from './uniswap-v2/DefiveUniswapV2Pool.ts';

const mapUniswapV2: Record<string, typeof UniswapV2Pool> = {
  'avax-swapsicle': SwapsicleUniswapV2Pool,
  'bsc-mdex': MdexUniswapV2Pool,
  'bsc-biswap': BiSwapUniswapV2Pool,
  'cronos-mmf': MMFUniswapV2Pool,
  'fantom-tombswap': TombSwapUniswapV2Pool,
  'metis-netswap': NetswapUniswapV2Pool,
  'moonbeam-stella': StellaUniswapV2Pool,
  'sonic-defive': DefiveUniswapV2Pool,
};

const mapSolidly: Record<string, typeof SolidlyPool> = {
  'bsc-cone': ConeSolidlyPool,
  'arbitrum-solidlizard': ConeSolidlyPool,
  'fantom-spirit-v2': SpiritSwapV2SolidlyPool,
  'fantom-fvm': BVMSolidlyPool,
  'optimism-velodrome': VelodromeSolidlyPool,
  'linea-solidly-nile': VelodromeSolidlyPool,
  'fraxtal-ra': VelodromeSolidlyPool,
  'optimism-velodrome-v2': VelodromeV2SolidlyPool,
  'mode-velodrome-v2': VelodromeV2ModeSolidlyPool,
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
  'scroll-nuri': VelodromeSolidlyPool,
  'scroll-tokan': TokanSolidlyPool,
  'sonic-shadow': SpiritSwapV2SolidlyPool,
};

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
