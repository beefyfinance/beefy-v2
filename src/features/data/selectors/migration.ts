import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectWalletAddress } from './wallet';
import { BIG_ZERO } from '../../../helpers/big-number';
import type { BaseMigrationConfig } from '../apis/config-types';
import { selectVaultById } from './vaults';

export const selectShouldInitMigration = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.migrators);

export const selectUserBalanceToMigrateByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], _migrationId: BaseMigrationConfig['id']) =>
    state.user.migration,
  (state: BeefyState, _vaultId: VaultEntity['id'], _migrationId: BaseMigrationConfig['id']) =>
    selectWalletAddress(state),
  (state: BeefyState, vaultId: VaultEntity['id'], _migrationId: BaseMigrationConfig['id']) =>
    vaultId,
  (state: BeefyState, _vaultId: VaultEntity['id'], migrationId: BaseMigrationConfig['id']) =>
    migrationId,
  (migrationState, walletAddress, vaultId, migrationId) => {
    return (
      migrationState.byUserAddress[walletAddress]?.byVaultId[vaultId]?.byMigrationId[migrationId] ||
      BIG_ZERO
    );
  }
);

export const selectMigratorById = createSelector(
  (state: BeefyState, _migratorId: BaseMigrationConfig['id']) => state.user.migration.byMigrationId,
  (state: BeefyState, migratorId: BaseMigrationConfig['id']) => migratorId,
  (migratorsById, migratorId) => migratorsById[migratorId]
);

export const selectMigrationIdsByVaultId = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => vault.migrationIds || []
);
