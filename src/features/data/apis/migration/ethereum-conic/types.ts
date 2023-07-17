import type BigNumber from 'bignumber.js';
import type { BaseMigrationConfig } from '../../config-types';
import type { CommonMigrationUpdateFulfilledPayload } from '../migration-types';

export type ConicMigrationConfig = BaseMigrationConfig;

export interface ConicMigrationData {
  initialized: boolean;
  balance: BigNumber;
}

export type ConicMigrationUpdateFulfilledPayload = CommonMigrationUpdateFulfilledPayload;
