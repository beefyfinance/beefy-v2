import type { Chain } from 'viem/chains';
import type { ChainEntity } from '../../entities/chain';
import type { ChainConfig } from '../config-types';
export declare function buildViemChain(chain: ChainEntity | ChainConfig): Chain;
