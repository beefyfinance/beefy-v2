import { createSlice, type PayloadAction, type WritableDraft } from '@reduxjs/toolkit';
import { migratorLoad, migratorUpdate } from '../../actions/migrator.ts';
import type {
  MigrationState,
  UserDataSateFulfilled,
  UserDataSateRejected,
  UserDataStatePending,
} from './migration-types.ts';
import type { MigratorUpdateParams } from '../../apis/migration/migration-types.ts';

const migrationInitialState: MigrationState = { byUserAddress: {}, byMigrationId: {} };

export const migrationSlice = createSlice({
  name: 'migration',
  initialState: migrationInitialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(migratorLoad.pending, (sliceState, action) => {
        sliceState.byMigrationId[action.meta.arg.migrationId] = { status: 'pending' };
      })
      .addCase(migratorLoad.rejected, (sliceState, action) => {
        console.error('Failed to load migrator', action.meta.arg.migrationId, action.error);
        sliceState.byMigrationId[action.meta.arg.migrationId] = {
          status: 'rejected',
          error: action.error,
        };
      })
      .addCase(migratorLoad.fulfilled, (sliceState, action) => {
        sliceState.byMigrationId[action.payload.id] = {
          status: 'fulfilled',
          ...action.payload,
        };
      })
      .addCase(migratorUpdate.pending, (sliceState, action) => {
        const { vaultId, migrationId, walletAddress } = action.meta.arg;
        const walletKey = walletAddress.toLowerCase();
        const existing =
          sliceState.byUserAddress[walletKey]?.byVaultId[vaultId]?.byMigrationId[migrationId];

        if (!existing) {
          if (sliceState.byUserAddress[walletKey] === undefined) {
            sliceState.byUserAddress[walletKey] = {
              byVaultId: {},
            };
          }
          if (sliceState.byUserAddress[walletKey].byVaultId[vaultId] === undefined) {
            sliceState.byUserAddress[walletKey].byVaultId[vaultId] = { byMigrationId: {} };
          }
        }

        sliceState.byUserAddress[walletKey].byVaultId[vaultId].byMigrationId[migrationId] = {
          ...existing,
          status: 'pending',
          lastRequest: {
            id: action.meta.requestId,
            timestamp: Date.now(),
          },
        };
      })
      .addCase(migratorUpdate.rejected, (sliceState, action) => {
        const userState = getPendingUserData(sliceState, action);
        if (!userState) {
          console.warn(
            'Ignoring migratorUpdate.rejected action because no matching pending request was found'
          );
          return;
        }
        const [userData, setUserData] = userState;
        setUserData({
          ...userData,
          status: 'rejected',
          lastRejected: {
            id: action.meta.requestId,
            timestamp: Date.now(),
          },
          error: action.error,
          // have to clear lastFulfilled on rejection as we don't know if our data is still valid
          lastFulfilled: undefined,
        });
      })
      .addCase(migratorUpdate.fulfilled, (sliceState, action) => {
        const userState = getPendingUserData(sliceState, action);
        if (!userState) {
          console.warn(
            'Ignoring migratorUpdate.fulfilled action because no matching pending request was found'
          );
          return;
        }
        const [userData, setUserData] = userState;
        setUserData({
          ...userData,
          status: 'fulfilled',
          lastFulfilled: {
            id: action.meta.requestId,
            timestamp: Date.now(),
          },
          data: action.payload.data,
        });
      });
  },
});

function getPendingUserData<
  TAction extends PayloadAction<
    unknown,
    string,
    {
      arg: MigratorUpdateParams;
      requestId: string;
      requestStatus: 'fulfilled' | 'rejected';
    }
  >,
>(sliceState: WritableDraft<MigrationState>, action: TAction) {
  const { vaultId, migrationId, walletAddress } = action.meta.arg;
  const walletKey = walletAddress.toLowerCase();
  const userData =
    sliceState.byUserAddress[walletKey]?.byVaultId[vaultId]?.byMigrationId[migrationId];
  if (
    !userData ||
    userData.status !== 'pending' ||
    userData.lastRequest.id !== action.meta.requestId
  ) {
    return undefined;
  }
  const setUserData = (newData: UserDataSateFulfilled | UserDataSateRejected) => {
    sliceState.byUserAddress[walletKey].byVaultId[vaultId].byMigrationId[migrationId] = newData;
  };
  // as due to BigNumber types with WritableDraft not being compatible
  return [userData as UserDataStatePending, setUserData] as const;
}
