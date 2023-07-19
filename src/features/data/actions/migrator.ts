import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import { getConfigApi, getMigrationApi } from '../apis/instances';
import type { VaultEntity } from '../entities/vault';
import type { MigratorExecuteProps } from '../apis/migration/migration-types';
import type { MigrationConfig } from '../reducers/wallet/migration';

export interface FulfilledAllMigratorsPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: MigrationConfig[];
  };
  state: BeefyState;
}

export const fetchAllMigrators = createAsyncThunk<
  FulfilledAllMigratorsPayload,
  void,
  { state: BeefyState }
>('migration/fetchAllMigrators', async (_, { getState }) => {
  const api = getConfigApi();
  const migrators = await api.fetchAllMigrators();
  return { byChainId: migrators, state: getState() };
});

export const migratorUpdate = createAsyncThunk<
  void,
  { vaultId: VaultEntity['id']; migrationId: MigrationConfig['id']; walletAddress: string },
  { state: BeefyState }
>('migration/update', async ({ vaultId, migrationId, walletAddress }, { dispatch }) => {
  const migrationApi = await getMigrationApi();
  const migrator = await migrationApi.getMigrator(migrationId);
  dispatch(migrator.update({ vaultId, walletAddress }));
});

export const migratorExecute = createAsyncThunk<void, MigratorExecuteProps, { state: BeefyState }>(
  'migration/update',
  async ({ vaultId, t, migrationId }, { dispatch }) => {
    const migrationApi = await getMigrationApi();
    const migrator = await migrationApi.getMigrator(migrationId);
    dispatch(migrator.execute({ vaultId, t, migrationId }));
  }
);
