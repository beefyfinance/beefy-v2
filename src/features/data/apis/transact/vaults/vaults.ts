import type { VaultEntity } from '../../../entities/vault.ts';
import type { BeefyStateFn } from '../../../store/types.ts';
import { createFactory } from '../../../utils/factory-utils.ts';
import type { VaultTypeConstructor } from './IVaultType.ts';

function makeLazyLoader<T extends VaultEntity>(loader: () => Promise<VaultTypeConstructor<T>>) {
  const getConstructor = createFactory(loader);

  return async (vault: T, getState: BeefyStateFn) => {
    const constructor = await getConstructor();
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
