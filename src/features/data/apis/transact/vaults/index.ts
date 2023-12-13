import type { VaultType, VaultTypeConstructor } from './IVaultType';
import type { VaultEntity } from '../../../entities/vault';
import type { GetStateFn } from '../../../../../redux-types';

function makeLazyLoader<T extends VaultType>(loader: () => Promise<VaultTypeConstructor<T>>) {
  let constructor: VaultTypeConstructor<T> | undefined;

  return async (vault: VaultEntity, getState: GetStateFn) => {
    if (!constructor) {
      constructor = await loader();
    }

    const instance = new constructor(vault, getState);
    await instance.initialize();
    return instance;
  };
}

export const vaultTypeBuildersById = {
  gov: makeLazyLoader(async () => (await import('./GovVaultType')).GovVaultType),
  standard: makeLazyLoader(async () => (await import('./StandardVaultType')).StandardVaultType),
} as const satisfies Record<
  VaultEntity['type'],
  (vault: VaultEntity, getState: GetStateFn) => Promise<VaultType>
>;
