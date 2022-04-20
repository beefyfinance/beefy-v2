import { ChainConfig } from '../apis/config-types';

/**
 * The chain entity as you know it
 * bsc, harmony, avax, etc
 * Sometimes named "network"
 * todo: for now ChainEntity is the same as the ChainConfig, but they might want to diverge
 *
 * We give another name to "chainId" to avoid any confusion between
 * beefy chain id ("harmony", "bsc") and the network chain id (8, 16, etc)
 */
export type ChainEntity = Omit<ChainConfig, 'chainId'> & { networkChainId: number };
