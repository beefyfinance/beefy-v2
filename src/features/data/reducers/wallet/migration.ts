import { type AnyAction, type Draft, createSlice } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';
import { type BigNumber } from 'bignumber.js';
import { fetchAllMigrators } from '../../actions/migrator';
import type {
  ConicMigrationConfig,
  ConicMigrationData,
} from '../../apis/migration/ethereum-conic/types';
import type { CommonMigrationUpdateFulfilledAction } from '../../apis/migration/migration-types';

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

function isCommonMigrationUpdateFulfilledAction(
  action: AnyAction
): action is CommonMigrationUpdateFulfilledAction {
  const migrationId = action.payload?.migrationId || undefined;
  return migrationId && action.type === `migration/${migrationId}/update/fulfilled`;
}

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

    builder.addMatcher(isCommonMigrationUpdateFulfilledAction, (sliceState, action) => {
      const { balance, walletAddress, vaultId, migrationId } = action.payload;
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
