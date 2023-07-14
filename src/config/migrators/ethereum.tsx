import type { MigrationConfig } from '../../features/data/reducers/wallet/migration';

export const migrators = [
  {
    id: 'ethereum-conic',
    name: 'Conic Finance',
    icon: 'CNC',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
