/* eslint-disable @typescript-eslint/no-explicit-any */
import type BigNumber from 'bignumber.js';
import type { BaseMigrationConfig } from '../config-types';
import type { AsyncThunk } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';
import type { Namespace, TFunction } from 'react-i18next';

export interface IMigrationApi {
  getMigrator(id: BaseMigrationConfig['id']): Promise<Migrator>;
}

export interface Migrator {
  update: AsyncThunk<any, MigratorUpdateProps, any>;
  execute: AsyncThunk<any, MigratorActionProps, any>;
}

export interface FullFilledFetchBalanceFromUnderlyingProtocol {
  readonly balance: BigNumber;
  readonly vaultId: VaultEntity['id'];
  readonly walletAddress: string;
  readonly migrationId: BaseMigrationConfig['id'];
}

export interface MigratorActionProps {
  readonly vaultId: VaultEntity['id'];
  t: TFunction<Namespace>;
  readonly migrationId: BaseMigrationConfig['id'];
}

export interface MigratorUpdateProps {
  vaultId: VaultEntity['id'];
  walletAddress: string;
}
