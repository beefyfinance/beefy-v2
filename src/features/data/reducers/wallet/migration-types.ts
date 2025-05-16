import type BigNumber from 'bignumber.js';
import type { BaseMigrationConfig } from '../../apis/config-types.ts';
import type { VaultEntity } from '../../entities/vault.ts';

export type MigrationConfig = BaseMigrationConfig;
type UserMigrationData = {
  [migrationId: string]: {
    initialized: boolean;
    balance: BigNumber;
  };
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
