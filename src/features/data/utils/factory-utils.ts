import { ChainEntity } from '../entities/chain';

/**
 * Creates a new factory function based on the input factory function
 * Adds an instance cache by chain to have exactly one instance by chain
 */
export function createFactoryWithCacheByChain<T>(
  factoryFn: (chainId: ChainEntity) => T
): (chainId: ChainEntity) => T {
  const cacheByChainId: { [chainId: ChainEntity['id']]: T } = {};

  return (chain: ChainEntity): T => {
    if (cacheByChainId[chain.id] === undefined) {
      cacheByChainId[chain.id] = factoryFn(chain);
    }
    return cacheByChainId[chain.id];
  };
}
