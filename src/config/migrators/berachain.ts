import type { MigrationConfig } from '../../features/data/reducers/wallet/migration-types.ts';

export const migrators = [
  {
    id: 'bera-infrared',
    name: 'Infrared',
    icon: 'Infrared',
  },
  {
    id: 'bera-kodiak',
    name: 'Kodiak',
    icon: 'KDK',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
