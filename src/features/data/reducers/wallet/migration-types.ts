import type { VaultEntity } from '../../entities/vault.ts';
import type { BaseUserData, MigratorLoadPayload } from '../../apis/migration/migration-types.ts';
import type { SerializedError } from '@reduxjs/toolkit';

type MigratorPending = {
  status: 'pending';
};

type MigratorFulfilled = {
  status: 'fulfilled';
} & MigratorLoadPayload;

type MigratorRejected = {
  status: 'rejected';
  error: SerializedError;
};

export type MigratorState = MigratorPending | MigratorFulfilled | MigratorRejected;

type RequestMeta = {
  id: string;
  timestamp: number;
};

type WithFulfilled<TData> = { lastFulfilled: RequestMeta; data: TData };
type WithoutFulfilled = { lastFulfilled?: undefined };

type WithRejected = { lastRejected: RequestMeta; error: SerializedError };
type WithoutRejected = { lastRejected?: undefined };

export type UserDataStatePending<TData extends BaseUserData = BaseUserData> = {
  status: 'pending';
  lastRequest: RequestMeta;
} & (WithFulfilled<TData> | WithoutFulfilled) &
  (WithRejected | WithoutRejected);

export type UserDataSateFulfilled<TData extends BaseUserData = BaseUserData> = {
  status: 'fulfilled';
  lastRequest: RequestMeta;
} & WithFulfilled<TData> &
  (WithRejected | WithoutRejected);

export type UserDataSateRejected = {
  status: 'rejected';
  lastRequest: RequestMeta;
} & WithRejected &
  WithoutFulfilled;

export type UserDataState<TData extends BaseUserData = BaseUserData> =
  | UserDataStatePending<TData>
  | UserDataSateFulfilled<TData>
  | UserDataSateRejected;

export interface MigrationState {
  byMigrationId: {
    [migrationId: string]: MigratorState;
  };
  byUserAddress: {
    [address: string]: {
      byVaultId: {
        [vaultId: VaultEntity['id']]: {
          byMigrationId: {
            [migrationId: string]: UserDataState;
          };
        };
      };
    };
  };
}
