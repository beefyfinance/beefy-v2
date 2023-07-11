/* eslint-disable @typescript-eslint/no-explicit-any */

import type BigNumber from 'bignumber.js';
import type { BaseMigrationConfig } from '../config-types';
import type { AsyncThunk } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';

export interface IMigrationApi {
  getMigrator(id: BaseMigrationConfig['id']): Promise<Migrator>;
}

export interface Migrator {
  update: AsyncThunk<any, any, any>;
  execute?: AsyncThunk<any, any, any>;
}

export interface FullFilledFetchBalanceFromUnderlyingProtocol {
  balance: BigNumber;
  vaultId: VaultEntity['id'];
  walletAddress: string;
  migrationId: BaseMigrationConfig['id'];
}
