import { getConfigApi, getMigrationApi } from '../apis/instances.ts';
import type { MigratorExecuteProps } from '../apis/migration/migration-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { MigrationConfig } from '../reducers/wallet/migration-types.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export interface FulfilledAllMigratorsPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: MigrationConfig[];
  };
  state: BeefyState;
}

export const fetchAllMigrators = createAppAsyncThunk<FulfilledAllMigratorsPayload, void>(
  'migration/fetchAllMigrators',
  async (_, { getState }) => {
    const api = await getConfigApi();
    const migrators = await api.fetchAllMigrators();
    return { byChainId: migrators, state: getState() };
  }
);

export const migratorUpdate = createAppAsyncThunk<
  void,
  {
    vaultId: VaultEntity['id'];
    migrationId: MigrationConfig['id'];
    walletAddress: string;
  }
>('migration/update', async ({ vaultId, migrationId, walletAddress }, { dispatch }) => {
  const migrationApi = await getMigrationApi();
  const migrator = await migrationApi.getMigrator(migrationId);
  dispatch(migrator.update({ vaultId, walletAddress }));
});

export const migratorExecute = createAppAsyncThunk<void, MigratorExecuteProps>(
  'migration/execute',
  async ({ vaultId, t, migrationId }, { dispatch }) => {
    const migrationApi = await getMigrationApi();
    const migrator = await migrationApi.getMigrator(migrationId);
    dispatch(migrator.execute({ vaultId, t, migrationId }));
  }
);
