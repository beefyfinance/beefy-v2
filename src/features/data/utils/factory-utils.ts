import type { ChainEntity } from '../entities/chain.ts';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCachedFactory<FN extends (...args: any[]) => any>(
  factoryFn: FN,
  keyFn: (...args: Parameters<FN>) => string = (...args) => JSON.stringify(args)
) {
  const cache: {
    [index: string]: ReturnType<FN>;
  } = {};
  return (...args: Parameters<FN>) => {
    const index = keyFn(...args);
    let value = cache[index];
    if (value === undefined) {
      value = cache[index] = factoryFn(...args);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
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

  return async (initializer?: I): Promise<T> => {
    if (factoryPromise === undefined) {
      if (!initializer) {
        throw new Error('Initializer is required for the first call');
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
