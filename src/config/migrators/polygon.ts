import type { MigrationConfig } from '../../features/data/reducers/wallet/migration-types.ts';

export const migrators = [
  {
    id: 'polygon-pearl',
    name: 'Pearl',
    icon: 'PEARL',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
