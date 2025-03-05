import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { getConfigApi, getMigrationApi } from '../apis/instances.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { MigratorExecuteProps } from '../apis/migration/migration-types.ts';
import type { MigrationConfig } from '../reducers/wallet/migration.ts';

export interface FulfilledAllMigratorsPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: MigrationConfig[];
  };
  state: BeefyState;
}

export const fetchAllMigrators = createAsyncThunk<
  FulfilledAllMigratorsPayload,
  void,
  {
    state: BeefyState;
  }
>('migration/fetchAllMigrators', async (_, { getState }) => {
  const api = await getConfigApi();
  const migrators = await api.fetchAllMigrators();
  return { byChainId: migrators, state: getState() };
});

export const migratorUpdate = createAsyncThunk<
  void,
  {
    vaultId: VaultEntity['id'];
    migrationId: MigrationConfig['id'];
    walletAddress: string;
  },
  {
    state: BeefyState;
  }
>('migration/update', async ({ vaultId, migrationId, walletAddress }, { dispatch }) => {
  const migrationApi = await getMigrationApi();
  const migrator = await migrationApi.getMigrator(migrationId);
  dispatch(migrator.update({ vaultId, walletAddress }));
});

export const migratorExecute = createAsyncThunk<
  void,
  MigratorExecuteProps,
  {
    state: BeefyState;
  }
>('migration/execute', async ({ vaultId, t, migrationId }, { dispatch }) => {
  const migrationApi = await getMigrationApi();
  const migrator = await migrationApi.getMigrator(migrationId);
  dispatch(migrator.execute({ vaultId, t, migrationId }));
});
