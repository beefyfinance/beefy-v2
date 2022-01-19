import { ChainConfig } from '../apis/config';

/**
 * The chain entity as you know it
 * bsc, harmony, avax, etc
 * Sometimes named "network"
 * todo: for now ChainEntity is the same as the ChainConfig, but they might want to diverge
 */
export type ChainEntity = ChainConfig;
