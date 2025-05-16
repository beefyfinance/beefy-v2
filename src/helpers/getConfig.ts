import type { MinterConfig } from '../features/data/apis/config-types.ts';
import type { ChainEntity } from '../features/data/entities/chain.ts';
import type { MigrationConfig } from '../features/data/reducers/wallet/migration-types.ts';

const mintersPathToImportFn = import.meta.glob<MinterConfig[]>('../config/minters/*.ts', {
  import: 'minters',
});

export async function getMinterConfig(chainId: ChainEntity['id']) {
  const importFn = mintersPathToImportFn[`../config/minters/${chainId}.ts`];
  return importFn ? await importFn() : [];
}

const migratorsPathToImportFn = import.meta.glob<MigrationConfig[]>('../config/migrators/*.ts', {
  import: 'migrators',
});

export async function getMigratorConfig(chainId: ChainEntity['id']) {
  const importFn = migratorsPathToImportFn[`../config/migrators/${chainId}.ts`];
  return importFn ? await importFn() : [];
}
