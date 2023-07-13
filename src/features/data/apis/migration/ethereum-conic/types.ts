import type { VaultEntity } from '../../../entities/vault';
import type { BaseMigrationConfig } from '../../config-types';

export type ConicMigrationConfig = BaseMigrationConfig & { readonly vaultIds: VaultEntity['id'][] };
