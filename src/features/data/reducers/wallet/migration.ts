import type { Draft } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';
import type BigNumber from 'bignumber.js';
import { fetchAllMigrators } from '../../actions/migrator';
import { fetchConicStakedBalance } from '../../apis/migration/ethereum-conic/migrator';
import type {
  ConicMigrationConfig,
  ConicMigrationData,
} from '../../apis/migration/ethereum-conic/types';

export type MigrationConfig = ConicMigrationConfig;

type UserMigrationData = {
  ['ethereum-conic']?: ConicMigrationData;
};

export interface MigrationState {
  byUserAddress: {
    [address: string]: {
      byVaultId: {
        [vaultId: VaultEntity['id']]: {
          byMigrationId: UserMigrationData;
        };
      };
    };
  };
  byMigrationId: {
    [migrationId: MigrationConfig['id']]: MigrationConfig;
  }; // loaded from configs
}

const migrationInitialState: MigrationState = { byUserAddress: {}, byMigrationId: {} };

export const migrationSlice = createSlice({
  name: 'migration',
  initialState: migrationInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAllMigrators.fulfilled, (sliceState, action) => {
      for (const migrators of Object.values(action.payload.byChainId)) {
        for (const migrator of migrators) {
          sliceState.byMigrationId[migrator.id] = migrator;
        }
      }
    });
    builder.addCase(fetchConicStakedBalance.fulfilled, (sliceState, action) => {
      const { balance, walletAddress, migrationId, vaultId } = action.payload;
      addUserBalanceToMigrate(sliceState, balance, walletAddress, vaultId, migrationId);
    });
  },
});

function addUserBalanceToMigrate(
  state: Draft<MigrationState>,
  balance: BigNumber,
  walletAddress: string,
  vaultId: VaultEntity['id'],
  migrationId: MigrationConfig['id']
) {
  if (state.byUserAddress[walletAddress] === undefined) {
    state.byUserAddress[walletAddress] = {
      byVaultId: {},
    };
  }

  if (state.byUserAddress[walletAddress].byVaultId[vaultId] === undefined) {
    state.byUserAddress[walletAddress].byVaultId[vaultId] = { byMigrationId: {} };
  }
  state.byUserAddress[walletAddress].byVaultId[vaultId].byMigrationId[migrationId] = {
    initialized: true,
    balance,
  };
}
