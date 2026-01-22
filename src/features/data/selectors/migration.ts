import { createSelector } from '@reduxjs/toolkit';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import { selectVaultById } from './vaults.ts';

export const selectMigratorById = (state: BeefyState, migratorId: string) =>
  state.user.migration.byMigrationId[migratorId];

export const selectMigrationIdsByVaultId = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => arrayOrStaticEmpty(vault.migrationIds)
);

export const selectMigrationVaultUserState = (
  state: BeefyState,
  migrationId: string,
  vaultId: VaultEntity['id'],
  walletAddress: string
) =>
  state.user.migration.byUserAddress[walletAddress.toLowerCase()]?.byVaultId[vaultId]
    ?.byMigrationId[migrationId] || undefined;

export const selectMigrationVaultUserData = createSelector(
  selectMigrationVaultUserState,
  userState => (userState?.lastFulfilled ? userState.data : undefined)
);
