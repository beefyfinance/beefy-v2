import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { BaseMigrationConfig } from '../apis/config-types';
import type { ChainEntity } from '../entities/chain';
import { getConfigApi } from '../apis/instances';
import type { VaultEntity } from '../entities/vault';
import { MigrationApi } from '../apis/migration';
import { selectVaultById } from '../selectors/vaults';

export interface FulfilledAllMigratorsPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: BaseMigrationConfig[];
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
  { vaultId: VaultEntity['id'] },
  { state: BeefyState }
>('migration/update', async ({ vaultId }, { getState, dispatch }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);
  const migrationApi = new MigrationApi();
  const migrator = await migrationApi.getMigrator(vault.migrationId);
  dispatch(migrator.update({ vaultId }));
});

export const migratorExecute = createAsyncThunk<
  void,
  { vaultId: VaultEntity['id'] },
  { state: BeefyState }
>('migration/update', async ({ vaultId }, { getState, dispatch }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);
  const migrationApi = new MigrationApi();
  const migrator = await migrationApi.getMigrator(vault.migrationId);
  dispatch(migrator.execute({ vaultId }));
});
