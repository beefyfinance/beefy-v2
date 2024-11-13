import type { MinterConfig } from '../features/data/apis/config-types';
import type { ChainEntity } from '../features/data/entities/chain';
import type { MigrationConfig } from '../features/data/reducers/wallet/migration';
import { createGlobLoader } from './globLoader';

const mintersPathToUrl = import.meta.glob<{ minters: MinterConfig[] }>('../config/minters/*.tsx', {
  as: 'url',
  eager: true,
});

const mintersKeyToUrl = createGlobLoader<{ minters: MinterConfig[] }>(mintersPathToUrl);

export function getMinterConfigSrc(chainId: ChainEntity['id']) {
  return mintersKeyToUrl([chainId]);
}

const migratorsPathToUrl = import.meta.glob<{ migrators: MigrationConfig[] }>(
  '../config/migrators/*.tsx',
  {
    as: 'url',
    eager: true,
  }
);

const migratorsKeyToUrl = createGlobLoader<{ migrators: MigrationConfig[] }>(migratorsPathToUrl);

export function getMigratorConfigSrc(chainId: ChainEntity['id']) {
  return migratorsKeyToUrl([chainId]);
}
