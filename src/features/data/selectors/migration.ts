import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectVaultById } from './vaults';
import { selectWalletAddress } from './wallet';
import { BIG_ZERO } from '../../../helpers/big-number';

export const selectShouldInitMigration = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.migrators);

export const selectHasMigrationByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.user.migration,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (migrationState, vault) => {
    return migrationState.byMigrationId[vault.migrationId]?.[vault.id] ? true : false;
  }
);

export const selectStakedLpAddressByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.user.migration,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (migrationState, vault) => {
    return migrationState.byMigrationId[vault.migrationId]?.[vault.id];
  }
);

export const selectUserBalanceToMigrateByVaultId = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.user.migration,
  (state: BeefyState, _vaultId: VaultEntity['id']) => selectWalletAddress(state),
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (migrationState, walletAddress, vaultId) => {
    return migrationState.byUserAddress[walletAddress]?.[vaultId] || BIG_ZERO;
  }
);
