import type { KeysOfUnion } from '../features/data/utils/types-utils';
export declare function cloneDeep<T>(input: T): T;
type Entries<T> = [keyof T, T[keyof T]][];
/** Key type preserving Object.entries - assumes the object input only has the keys in type T */
export declare function entries<T extends object>(input: T): Entries<T>;
type StrictEntries<T> = Exclude<{
    [K in keyof T]: [K, T[K]];
}[keyof T], undefined>[];
/** Pair type preserving Object.entries - assumes the object input only has the keys in type T */
export declare function strictEntries<T extends object>(input: T): StrictEntries<T>;
/** Key type preserving Object.keys - assumes the object input only has the keys in type T */
export declare function keys<TKey extends string>(input: {
    [K in TKey]?: unknown;
}): TKey[];
export declare function fromKeys<K extends string, V>(arr: K[], value: V): Record<K, V>;
export declare function fromKeysBy<K extends string, V>(arr: K[], valueFn: (key: K) => V): Record<K, V>;
type Mapped<T extends string, V, K extends string, KF extends (key: T) => K> = {
    [key in T as KF extends (key: key) => infer U ? U : never]: V;
};
export declare function fromKeysMapper<T extends string, V, K extends string, KF extends (key: T) => K>(arr: T[], valueFn: (key: T) => V, keyFn: KF): Mapped<T, V, K, KF>;
/** Push value to array at map[key], or set map key to [value] if array does not exist yet */
export declare function pushOrSet<K extends string, V>(map: Record<K, V[]>, key: K, value: V): Record<K, V[]>;
export declare function typedDefaults<T extends object>(input: Partial<T> | undefined | null, defaults: T): T;
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
export declare function typedDefaultsDeep<T extends object>(input: DeepPartial<T> | undefined | null, defaults: T): T;
type DistributedOmit<TEntry, TKeys extends keyof TEntry> = {
    [K in keyof TEntry as K extends TKeys ? never : K]: TEntry[K];
};
export declare function distributedOmit<TEntry extends {
    [key: string]: unknown;
}, TKeys extends keyof TEntry>(entry: TEntry, ...keys: TKeys[]): DistributedOmit<TEntry, TKeys>;
export declare function firstKey<T extends {
    [key: string]: unknown;
}>(obj: T): KeysOfUnion<T> | undefined;
export {};
