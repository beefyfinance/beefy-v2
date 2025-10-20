import type { MigrationConfig } from '../../features/data/reducers/wallet/migration-types.ts';

export const migrators = [
  {
    id: 'plasma-lithos',
    name: 'Lithos',
    icon: 'LITH',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
