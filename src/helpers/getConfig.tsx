import type { MinterConfig } from '../features/data/apis/config-types';
import type { ChainEntity } from '../features/data/entities/chain';
import type { MigrationConfig } from '../features/data/reducers/wallet/migration';

const mintersPathToImportFn = import.meta.glob<MinterConfig[]>('../config/minters/*.tsx', {
  import: 'minters',
});

export async function getMinterConfig(chainId: ChainEntity['id']) {
  const importFn = mintersPathToImportFn[`../config/minters/${chainId}.tsx`];
  return importFn ? await importFn() : [];
}

const migratorsPathToImportFn = import.meta.glob<MigrationConfig[]>('../config/migrators/*.tsx', {
  import: 'migrators',
});

export async function getMigratorConfig(chainId: ChainEntity['id']) {
  const importFn = migratorsPathToImportFn[`../config/migrators/${chainId}.tsx`];
  return importFn ? await importFn() : [];
}
