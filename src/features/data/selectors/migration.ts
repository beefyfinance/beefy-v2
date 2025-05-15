import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { MigrationConfig } from '../reducers/wallet/migration-types.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import { isLoaderIdle } from './data-loader-helpers.ts';
import { selectVaultById } from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';

export const selectShouldInitMigration = (state: BeefyState) =>
  isLoaderIdle(state.ui.dataLoader.global.migrators);

export const selectUserBalanceToMigrateByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], _migrationId: MigrationConfig['id']) =>
    state.user.migration.byUserAddress,
  (state: BeefyState, _vaultId: VaultEntity['id'], _migrationId: MigrationConfig['id']) =>
    selectWalletAddress(state),
  (_state: BeefyState, vaultId: VaultEntity['id'], _migrationId: MigrationConfig['id']) => vaultId,
  (_state: BeefyState, _vaultId: VaultEntity['id'], migrationId: MigrationConfig['id']) =>
    migrationId,
  (byUserAddress, walletAddress, vaultId, migrationId) => {
    if (!walletAddress) return { balance: BIG_ZERO, initialized: false };

    return (
      byUserAddress[walletAddress.toLowerCase()]?.byVaultId[vaultId]?.byMigrationId[
        migrationId
      ] || { balance: BIG_ZERO, initialized: false }
    );
  }
);

export const selectMigratorById = createSelector(
  (state: BeefyState, _migratorId: MigrationConfig['id']) => state.user.migration.byMigrationId,
  (_state: BeefyState, migratorId: MigrationConfig['id']) => migratorId,
  (migratorsById, migratorId) => migratorsById[migratorId]
);

export const selectMigrationIdsByVaultId = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => arrayOrStaticEmpty(vault.migrationIds)
);
