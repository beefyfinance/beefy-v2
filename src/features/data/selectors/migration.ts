import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectVaultById } from './vaults';
import { selectWalletAddress } from './wallet';
import { BIG_ZERO } from '../../../helpers/big-number';
import type { BaseMigrationConfig } from '../apis/config-types';

export const selectShouldInitMigration = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.migrators);

export const selectHasMigrationByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.user.migration,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (migrationState, vault) => {
    return migrationState.byMigrationId[vault.migrationId]?.lpByVaultId[vault.id] ? true : false;
  }
);

export const selectStakedLpAddressByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.user.migration,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (migrationState, vault) => {
    return migrationState.byMigrationId[vault.migrationId].lpByVaultId[vault.id];
  }
);

export const selectUserBalanceToMigrateByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.user.migration,
  (state: BeefyState, _vaultId: VaultEntity['id']) => selectWalletAddress(state),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (migrationState, walletAddress, vault) => {
    return (
      migrationState.byUserAddress[walletAddress]?.byVaultId[vault.id]?.byMigrationId[
        vault.migrationId
      ] || BIG_ZERO
    );
  }
);

export const selectMigratorById = createSelector(
  (state: BeefyState, _migratorId: BaseMigrationConfig['id']) => state.user.migration.byMigrationId,
  (state: BeefyState, migratorId: BaseMigrationConfig['id']) => migratorId,
  (migratorsById, migratorId) => migratorsById[migratorId]
);
