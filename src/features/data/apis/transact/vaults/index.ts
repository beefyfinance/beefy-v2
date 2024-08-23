import type { VaultTypeConstructor } from './IVaultType';
import type { VaultEntity } from '../../../entities/vault';
import type { BeefyStateFn } from '../../../../../redux-types';

function makeLazyLoader<T extends VaultEntity>(loader: () => Promise<VaultTypeConstructor<T>>) {
  let constructor: VaultTypeConstructor<T> | undefined;

  return async (vault: T, getState: BeefyStateFn) => {
    if (!constructor) {
      constructor = await loader();
    }

    return new constructor(vault, getState);
  };
}

type VaultTypeBuilderFromVault<T extends VaultEntity> = ReturnType<typeof makeLazyLoader<T>>;

type TypeToConstructorMap = {
  [K in VaultEntity['type']]: VaultTypeBuilderFromVault<Extract<VaultEntity, { type: K }>>;
};

const vaultTypeBuildersById = {
  gov: makeLazyLoader(async () => (await import('./GovVaultType')).GovVaultType),
  standard: makeLazyLoader(async () => (await import('./StandardVaultType')).StandardVaultType),
  cowcentrated: makeLazyLoader(
    async () => (await import('./CowcentratedVaultType')).CowcentratedVaultType
  ),
} as const satisfies TypeToConstructorMap;

export function getVaultTypeBuilder<T extends VaultEntity>(vault: T): VaultTypeBuilderFromVault<T> {
  return vaultTypeBuildersById[vault.type] as VaultTypeBuilderFromVault<T>;
}
