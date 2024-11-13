import type { MinterConfig } from '../features/data/apis/config-types';
import type { ChainEntity } from '../features/data/entities/chain';
import type { MigrationConfig } from '../features/data/reducers/wallet/migration';

const mintersPathToImportFn = import.meta.glob<{ minters: MinterConfig[] }>(
  '../config/minters/*.tsx',
  { import: 'minters' }
);

export async function getMinterConfigSrc(chainId: ChainEntity['id']) {
  const importFn = mintersPathToImportFn[`../config/minters/${chainId}.tsx`];
  return importFn ? await importFn() : [];
}

const migratorsPathToImportFn = import.meta.glob<{ migrators: MigrationConfig[] }>(
  '../config/migrators/*.tsx',
  { import: 'migrators' }
);

export async function getMigratorConfigSrc(chainId: ChainEntity['id']) {
  const importFn = migratorsPathToImportFn[`../config/migrators/${chainId}.tsx`];
  return importFn ? await importFn() : [];
}
