import type { VaultEntity } from '../../../entities/vault.ts';
import type { BeefyStateFn } from '../../../store/types.ts';
import type { VaultTypeConstructor } from './IVaultType.ts';

function makeLazyLoader<T extends VaultEntity>(loader: () => Promise<VaultTypeConstructor<T>>) {
  // cache the promise, not the resolved value: callers race in via Promise.allSettled over every
  // zap vault, so a resolved-value guard is still undefined for all of them and each one triggers
  // its own import()
  let pending: Promise<VaultTypeConstructor<T>> | undefined;

  return async (vault: T, getState: BeefyStateFn) => {
    if (!pending) {
      // drop the cache on failure so a transient import error stays retryable
      pending = loader().catch(err => {
        pending = undefined;
        throw err;
      });
    }

    const constructor = await pending;
    return new constructor(vault, getState);
  };
}

type VaultTypeBuilderFromVault<T extends VaultEntity> = ReturnType<typeof makeLazyLoader<T>>;

type TypeToConstructorMap = {
  [K in VaultEntity['type']]: VaultTypeBuilderFromVault<
    Extract<
      VaultEntity,
      {
        type: K;
      }
    >
  >;
};

const vaultTypeBuildersById: TypeToConstructorMap = {
  gov: makeLazyLoader(async () => (await import('./GovVaultType.ts')).GovVaultType),
  standard: makeLazyLoader(async () => (await import('./StandardVaultType.ts')).StandardVaultType),
  cowcentrated: makeLazyLoader(
    async () => (await import('./CowcentratedVaultType.ts')).CowcentratedVaultType
  ),
  erc4626: makeLazyLoader(async () => (await import('./Erc4626VaultType.ts')).Erc4626VaultType),
};

export function getVaultTypeBuilder<T extends VaultEntity>(vault: T): VaultTypeBuilderFromVault<T> {
  return vaultTypeBuildersById[vault.type] as unknown as VaultTypeBuilderFromVault<T>; // ???
}
