import {
  AmmEntity,
  AmmEntitySolidly,
  AmmEntityUniswapV2,
  isSolidlyAmm,
  isUniswapV2Amm,
} from '../../entities/amm';
import { UniswapV2Pool } from './UniswapV2Pool';
import { ChainEntity } from '../../entities/chain';
import { SolidlyPool } from './SolidlyPool';
import { MdexUniswapV2Pool } from './MdexUniswapV2Pool';
import { IPool } from './types';
import { BiSwapUniswapV2Pool } from './BiSwapUniswapV2Pool';
import { ConeSolidlyPool } from './ConeSolidlyPool';
import { SwapsicleUniswapV2Pool } from './SwapsicleUniswapV2Pool';
import { MMFUniswapV2Pool } from './MMFUniswapV2Pool';
import { TombSwapUniswapV2Pool } from './TombSwapUniswapV2Pool';
import { SpiritSwapV2SolidlyPool } from './SpiritSwapV2SolidlyPool';
import { NetswapUniswapV2Pool } from './NetswapUniswapV2Pool';
import { StellaUniswapV2Pool } from './StellaUniswapV2Pool';
import { VelodromeSolidlyPool } from './VelodromeSolidlyPool';
import { EthereumSolidlyPool } from './EthereumSolidlyPool';

const mapUniswapV2: Record<string, typeof UniswapV2Pool> = {
  'avax-swapsicle': SwapsicleUniswapV2Pool,
  'bsc-mdex': MdexUniswapV2Pool,
  'bsc-biswap': BiSwapUniswapV2Pool,
  'cronos-mmf': MMFUniswapV2Pool,
  'fantom-tombswap': TombSwapUniswapV2Pool,
  'metis-netswap': NetswapUniswapV2Pool,
  'moonbeam-stella': StellaUniswapV2Pool,
  default: UniswapV2Pool,
} as const;

const mapSolidly: Record<string, typeof SolidlyPool> = {
  'bsc-cone': ConeSolidlyPool,
  'fantom-spirit-v2': SpiritSwapV2SolidlyPool,
  'optimism-velodrome': VelodromeSolidlyPool,
  'fantom-equalizer': VelodromeSolidlyPool,
  'ethereum-solidly': EthereumSolidlyPool,
  default: SolidlyPool,
} as const;

export function getPool(
  lpAddress: string,
  amm: AmmEntityUniswapV2,
  chain: ChainEntity
): UniswapV2Pool;
export function getPool(lpAddress: string, amm: AmmEntitySolidly, chain: ChainEntity): SolidlyPool;
export function getPool(lpAddress: string, amm: AmmEntity, chain: ChainEntity): IPool;
export function getPool(lpAddress: string, amm: AmmEntity, chain: ChainEntity): IPool {
  if (isUniswapV2Amm(amm)) {
    const Constructor = mapUniswapV2[amm.id] || mapUniswapV2.default;
    return new Constructor(lpAddress, amm, chain);
  } else if (isSolidlyAmm(amm)) {
    const Constructor = mapSolidly[amm.id] || mapSolidly.default;
    return new Constructor(lpAddress, amm, chain);
  } else {
    throw new Error(`Unknown AMM type`);
  }
}
