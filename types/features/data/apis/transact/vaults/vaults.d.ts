import type { VaultEntity } from '../../../entities/vault';
import type { BeefyStateFn } from '../../../store/types';
import type { VaultTypeConstructor } from './IVaultType';
declare function makeLazyLoader<T extends VaultEntity>(loader: () => Promise<VaultTypeConstructor<T>>): (vault: T, getState: BeefyStateFn) => Promise<import("./IVaultType").VaultTypeFromVault<T>>;
type VaultTypeBuilderFromVault<T extends VaultEntity> = ReturnType<typeof makeLazyLoader<T>>;
export declare function getVaultTypeBuilder<T extends VaultEntity>(vault: T): VaultTypeBuilderFromVault<T>;
export {};
