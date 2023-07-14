import type BigNumber from 'bignumber.js';
import type { BaseMigrationConfig } from '../../config-types';

export type ConicMigrationConfig = BaseMigrationConfig;

export interface ConicMigrationData {
  initialized: boolean;
  balance: BigNumber;
}
