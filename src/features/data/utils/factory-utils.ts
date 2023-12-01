import type { ChainEntity } from '../entities/chain';

/**
 * Creates a new factory function based on the input factory function,
 * that first resolves dependencies which are passed to the factory function
 * @param factoryFn
 * @param dependenciesFn
 */
export function createDependencyFactory<T, D>(
  factoryFn: (dependencies: D) => Promise<T>,
  dependenciesFn: () => Promise<D>
): () => Promise<T> {
  let factoryPromise: Promise<T> | undefined;

  return async (): Promise<T> => {
    if (factoryPromise === undefined) {
      factoryPromise = (async () => {
        return factoryFn(await dependenciesFn());
      })();
    }

    return factoryPromise;
  };
}

export function createDependencyInitializerFactory<T, D, I>(
  factoryFn: (initializer: I, dependencies: D) => Promise<T>,
  dependenciesFn: () => Promise<D>
): (initializer?: I) => Promise<T> {
  let factoryPromise: Promise<T> | undefined;

  return async (initializer: I): Promise<T> => {
    if (factoryPromise === undefined) {
      if (!initializer) {
        throw new Error('Initializer is required');
      }
      factoryPromise = (async () => {
        return factoryFn(initializer, await dependenciesFn());
      })();
    }

    return factoryPromise;
  };
}

export function createDependencyFactoryWithCacheByChain<T, D>(
  factoryFn: (chain: ChainEntity, dependencies: D) => Promise<T>,
  dependenciesFn: () => Promise<D>
): (chain: ChainEntity) => Promise<T> {
  const factoryPromiseByChainId: Record<ChainEntity['id'], Promise<T>> = {};
  let dependenciesPromise: Promise<D> | undefined;

  return async (chain: ChainEntity): Promise<T> => {
    if (factoryPromiseByChainId[chain.id] === undefined) {
      factoryPromiseByChainId[chain.id] = (async () => {
        if (dependenciesPromise === undefined) {
          dependenciesPromise = dependenciesFn();
        }

        return factoryFn(chain, await dependenciesPromise);
      })();
    }

    return factoryPromiseByChainId[chain.id];
  };
}
