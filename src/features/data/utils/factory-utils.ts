import type { ChainEntity } from '../entities/chain';

type FactoryFn<P, R> = (...props: P[]) => R;

export function createFactory<P, R>(factoryFn: FactoryFn<P, R>): FactoryFn<P, R> {
  let cache: R | undefined;
  return (...args: P[]): R => {
    if (cache === undefined) {
      cache = factoryFn(...args);
    }
    return cache;
  };
}

export function createCachedFactory<P, R>(
  factoryFn: FactoryFn<P, R>,
  keyFn: (...args: P[]) => string = (...args: P[]) => JSON.stringify(args)
): FactoryFn<P, R> {
  const cache: { [index: string]: R } = {};
  return (...args: P[]): R => {
    const index = keyFn(...args);
    if (cache[index] === undefined) {
      cache[index] = factoryFn(...args);
    }
    return cache[index]!;
  };
}

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
  const factoryPromiseByChainId: Partial<Record<ChainEntity['id'], Promise<T>>> = {};
  let dependenciesPromise: Promise<D> | undefined;

  return async (chain: ChainEntity): Promise<T> => {
    let factoryPromise = factoryPromiseByChainId[chain.id];
    if (factoryPromise === undefined) {
      factoryPromise = (async () => {
        if (dependenciesPromise === undefined) {
          dependenciesPromise = dependenciesFn();
        }

        return factoryFn(chain, await dependenciesPromise);
      })();
      factoryPromiseByChainId[chain.id] = factoryPromise;
    }

    return factoryPromise;
  };
}
