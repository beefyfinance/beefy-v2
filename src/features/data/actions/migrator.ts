import { getMigrationApi } from '../apis/instances.ts';
import type {
  ExecutePayload,
  MigratorExecuteParams,
  MigratorLoadParams,
  MigratorLoadPayload,
  MigratorUpdateParams,
  UpdatePayload,
} from '../apis/migration/migration-types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { getAddress } from 'viem';
import { selectMigrationVaultUserData, selectMigratorById } from '../selectors/migration.ts';
import { stepperStartWithSteps } from './wallet/stepper.ts';
import { omit } from 'lodash-es';

export const migratorLoad = createAppAsyncThunk<MigratorLoadPayload, MigratorLoadParams>(
  'migration/load',
  async ({ migrationId }) => {
    const migrationApi = await getMigrationApi();
    const migrator = await migrationApi.getMigrator(migrationId);
    return omit(migrator, ['update', 'execute']);
  },
  {
    // don't load if already attempted
    condition({ migrationId }, { getState }) {
      const state = getState();
      const migratorState = selectMigratorById(state, migrationId);
      return migratorState === undefined;
    },
  }
);

export const migratorUpdate = createAppAsyncThunk<UpdatePayload, MigratorUpdateParams>(
  'migration/update',
  async ({ vaultId, migrationId, walletAddress: maybeWalletAddress }, { dispatch, getState }) => {
    if (!maybeWalletAddress) {
      throw new Error('Wallet address is required for migrator update');
    }

    const walletAddress = getAddress(maybeWalletAddress);
    const migrationApi = await getMigrationApi();
    const migrator = await migrationApi.getMigrator(migrationId);
    const state = getState();
    const vault = selectVaultById(state, vaultId);

    const result = await migrator.update({
      migrationId,
      vault,
      walletAddress,
      dispatch,
      getState,
    });

    return {
      ...result,
      vault,
      walletAddress,
    };
  }
);

export const migratorExecute = createAppAsyncThunk<ExecutePayload, MigratorExecuteParams>(
  'migration/execute',
  async (
    { vaultId, migrationId, walletAddress: maybeWalletAddress, t },
    { dispatch, getState }
  ) => {
    const walletAddress = getAddress(maybeWalletAddress);
    const migrationApi = await getMigrationApi();
    const migrator = await migrationApi.getMigrator(migrationId);
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const data = selectMigrationVaultUserData(state, migrationId, vaultId, walletAddress);
    if (!data) {
      throw new Error(
        `No migration data found for ${walletAddress} on vault ${vaultId} and migrator ${migrationId}`
      );
    }

    const result = await migrator.execute({
      migrationId,
      vault,
      walletAddress,
      dispatch,
      getState,
      t,
      data,
    });

    dispatch(stepperStartWithSteps(result.steps, vault.chainId));

    return {
      ...result,
      vault,
      walletAddress,
    };
  }
);
