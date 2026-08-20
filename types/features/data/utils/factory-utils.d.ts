import type { ChainEntity } from '../entities/chain';
type FactoryFn<P, R> = (...props: P[]) => R;
export declare function createFactory<P, R>(factoryFn: FactoryFn<P, R>): FactoryFn<P, R>;
export declare function createCachedFactory<FN extends (...args: any[]) => any>(factoryFn: FN, keyFn?: (...args: Parameters<FN>) => string): (...args: Parameters<FN>) => ReturnType<FN>;
/**
 * Creates a new factory function based on the input factory function,
 * that first resolves dependencies which are passed to the factory function
 * @param factoryFn
 * @param dependenciesFn
 */
export declare function createDependencyFactory<T, D>(factoryFn: (dependencies: D) => Promise<T>, dependenciesFn: () => Promise<D>): () => Promise<T>;
export declare function createDependencyInitializerFactory<T, D, I>(factoryFn: (initializer: I, dependencies: D) => Promise<T>, dependenciesFn: () => Promise<D>): (initializer?: I) => Promise<T>;
export declare function createDependencyFactoryWithCacheByChain<T, D>(factoryFn: (chain: ChainEntity, dependencies: D) => Promise<T>, dependenciesFn: () => Promise<D>): (chain: ChainEntity) => Promise<T>;
export {};
