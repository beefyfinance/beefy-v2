import type { Draft } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';
import type BigNumber from 'bignumber.js';
import { fetchAllMigrators, fetchConicStakedBalance } from '../../actions/migrator';

export interface MigrationState {
  byUserAddress: {
    [address: string]: {
      [vaultId: VaultEntity['id']]: BigNumber;
    };
  };
  byMigrationId: {
    [migrationId: VaultEntity['migrationId']]: {
      //The storage value is the LP of the staked address on the underlying platform
      [vaultId: VaultEntity['id']]: string;
    };
  };
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
          if (sliceState.byMigrationId[migrator.migrationId] === undefined) {
            sliceState.byMigrationId[migrator.migrationId] = {};
          }
          for (const [vaultId, address] of Object.entries(migrator.vaultIds)) {
            sliceState.byMigrationId[migrator.migrationId][vaultId] = address;
          }
        }
      }
    });
    builder.addCase(fetchConicStakedBalance.fulfilled, (sliceState, action) => {
      const { balance, walletAddress, vaultId } = action.payload;
      addUserBalanceToMigrate(sliceState, balance, walletAddress, vaultId);
    });
  },
});

function addUserBalanceToMigrate(
  state: Draft<MigrationState>,
  balance: BigNumber,
  walletAddress: string,
  vaultId: VaultEntity['id']
) {
  if (state.byUserAddress[walletAddress] === undefined) {
    state.byUserAddress[walletAddress] = {};
  }
  state.byUserAddress[walletAddress][vaultId] = balance;
}
