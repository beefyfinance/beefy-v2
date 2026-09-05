import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import { selectVaultById } from './vaults.ts';

export const selectMigratorById = (state: BeefyState, migratorId: string) =>
  state.user.migration.byMigrationId[migratorId];

export const selectMigrationIdsByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) =>
  arrayOrStaticEmpty(selectVaultById(state, vaultId).migrationIds);

export const selectMigrationVaultUserState = (
  state: BeefyState,
  migrationId: string,
  vaultId: VaultEntity['id'],
  walletAddress: string
) =>
  state.user.migration.byUserAddress[walletAddress.toLowerCase()]?.byVaultId[vaultId]
    ?.byMigrationId[migrationId] || undefined;

export const selectMigrationVaultUserData = (
  state: BeefyState,
  migrationId: string,
  vaultId: VaultEntity['id'],
  walletAddress: string
) => {
  const userState = selectMigrationVaultUserState(state, migrationId, vaultId, walletAddress);
  return userState?.lastFulfilled ? userState.data : undefined;
};
