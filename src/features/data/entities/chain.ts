import type { ChainConfig } from '../apis/config-types.ts';

/**
 * The chain entity as you know it
 * bsc, harmony, avax, etc
 * Sometimes named "network"
 *
 * We give another name to "chainId" to avoid any confusion between
 * beefy chain id ("harmony", "bsc") and the network chain id (8, 16, etc)
 */
export type ChainEntity = Omit<
  ChainConfig,
  'chainId' | 'explorerTokenUrlTemplate' | 'explorerAddressUrlTemplate' | 'explorerTxUrlTemplate'
> & {
  networkChainId: number;
  explorerTokenUrlTemplate: string;
  explorerAddressUrlTemplate: string;
  explorerTxUrlTemplate: string;
};

export type ChainId = ChainEntity['id'];

/** native and wnative are one on-chain balance (arc, metis, celo), so nothing wraps or unwraps */
export function isChainNativeSharedWithWrapped(chain: Pick<ChainEntity, 'native'>): boolean {
  return !!chain.native.balanceSharedWithWrapped;
}
