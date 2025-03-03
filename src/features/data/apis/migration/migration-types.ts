import { type BigNumber } from 'bignumber.js';
import type { AsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';
import type { Namespace, TFunction } from 'react-i18next';
import type { MigrationConfig } from '../../reducers/wallet/migration';
import type { BeefyState } from '../../../../redux-types';
import type { Address, Chain } from 'viem';
import type { GasPricing } from '../gas-prices';

export interface IMigrationApi {
  getMigrator(id: MigrationConfig['id']): Promise<Migrator>;
}

export interface MigratorUpdateProps {
  vaultId: VaultEntity['id'];
  walletAddress: string;
}

export interface CommonMigrationUpdateFulfilledPayload {
  readonly balance: BigNumber;
  readonly vaultId: VaultEntity['id'];
  readonly walletAddress: string;
  readonly migrationId: MigrationConfig['id'];
}

export type CommonMigrationUpdateAsyncThunk = AsyncThunk<
  CommonMigrationUpdateFulfilledPayload,
  MigratorUpdateProps,
  { state: BeefyState }
>;

export type CommonMigrationUpdateFulfilledAction = PayloadAction<
  CommonMigrationUpdateFulfilledPayload,
  string,
  { arg: MigratorUpdateProps; requestId: string; requestStatus: 'fulfilled' },
  never
>;

export interface MigratorExecuteProps {
  readonly vaultId: VaultEntity['id'];
  t: TFunction<Namespace>;
  readonly migrationId: MigrationConfig['id'];
}

export type CommonMigrationExecuteAsyncThunk = AsyncThunk<
  void,
  MigratorExecuteProps,
  { state: BeefyState }
>;

export type MigratorUnstakeProps = {
  account: Address;
  chain: Chain | undefined;
} & GasPricing;

export interface Migrator {
  update: CommonMigrationUpdateAsyncThunk;
  execute: CommonMigrationExecuteAsyncThunk;
}
