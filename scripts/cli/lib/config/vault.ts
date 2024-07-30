import { join as joinPath } from 'node:path';
import { sortVaultKeys } from '../../../common/vault-fields';
import { VaultConfig } from '../../../../src/features/data/apis/config-types';
import { addressBookToAppId } from '../../../common/config';
import { RequireAtLeastOne } from '../../utils/types';
import { isEqual } from 'lodash';
import { createCachedFactory } from '../../utils/factory';
import { withLock } from '../../utils/promise';
import { loadJson, saveJson } from '../../../common/files';

function getVaultsConfigPath(chainId: string) {
  const appChainId = addressBookToAppId(chainId);
  return joinPath(__dirname, `../../../../src/config/vault/${appChainId}.json`);
}

export async function loadVaultsConfig(chainId: string): Promise<VaultConfig[]> {
  const configPath = getVaultsConfigPath(chainId);
  return loadJson<VaultConfig[]>(configPath);
}

async function saveVaultsConfig(chainId: string, vaults: VaultConfig[]) {
  const configPath = getVaultsConfigPath(chainId);
  return saveJson(configPath, vaults, 'prettier');
}

export const getVaultsConfig = createCachedFactory(loadVaultsConfig, chainId => chainId);

export async function getVault(
  vault: RequireAtLeastOne<
    Pick<VaultConfig, 'network' | 'id' | 'earnContractAddress'>,
    'id' | 'earnContractAddress'
  >,
  vaults?: VaultConfig[]
): Promise<VaultConfig | undefined> {
  const existingVaults = vaults || (await getVaultsConfig(vault.network));
  return existingVaults.find(
    v => v.id === vault.id || v.earnContractAddress === vault.earnContractAddress
  );
}

type NetworklessVaultConfig = Partial<Omit<VaultConfig, 'network'>>;
type VaultConfigFilter = Pick<VaultConfig, 'network'> &
  RequireAtLeastOne<NetworklessVaultConfig, keyof NetworklessVaultConfig>;

export async function getVaultsMatching(
  filter: VaultConfigFilter,
  vaults?: VaultConfig[]
): Promise<VaultConfig[]> {
  const existingVaults = vaults || (await getVaultsConfig(filter.network));
  return existingVaults.filter(vault =>
    Object.keys(filter).every(key => isEqual(vault[key], filter[key]))
  );
}

export async function editVaults(
  chainId: string,
  edit: (config: VaultConfig[]) => VaultConfig[] | Promise<VaultConfig[]>
) {
  return withLock(chainId, async () => {
    const existingVaults = await loadVaultsConfig(chainId);
    const editedVaults = await edit(existingVaults);
    await saveVaultsConfig(chainId, editedVaults);
    return editedVaults;
  });
}

export async function addVault(vault: VaultConfig) {
  return editVaults(vault.network, async vaults => {
    const duplicateVault = await getVault(vault, vaults);
    if (duplicateVault) {
      throw new Error(`Vault already exists in config: ${duplicateVault.id}`);
    }
    return [sortVaultKeys(vault), ...vaults];
  });
}

export async function editVault(
  id: string,
  chainId: string,
  edit: (config: VaultConfig) => VaultConfig | Promise<VaultConfig>
) {
  return editVaults(chainId, async vaults => {
    const index = vaults.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Vault not found: ${id}`);
    }
    vaults[index] = await edit({ ...vaults[index] });
    return vaults;
  });
}
