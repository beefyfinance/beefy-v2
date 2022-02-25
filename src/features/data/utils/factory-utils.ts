import { ChainEntity } from '../entities/chain';

/**
 * Creates a new factory function based on the input factory function
 * Adds an instance cache by chain to have exactly one instance by chain
 */
export function createFactoryWithCacheByChain<T>(
  factoryFn: (chain: ChainEntity) => Promise<T>
): (chain: ChainEntity) => Promise<T> {
  const cacheByChainId: { [chainId: ChainEntity['id']]: Promise<T> } = {};

  return (chain: ChainEntity): Promise<T> => {
    if (cacheByChainId[chain.id] === undefined) {
      cacheByChainId[chain.id] = factoryFn(chain);
    }
    return cacheByChainId[chain.id];
  };
}
