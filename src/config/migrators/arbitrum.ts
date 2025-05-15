import type { MigrationConfig } from '../../features/data/reducers/wallet/migration-types.ts';

export const migrators = [
  {
    id: 'l2-convex',
    name: 'Convex',
    icon: 'CVX',
  },
  {
    id: 'l2-curve',
    name: 'Curve',
    icon: 'CRV',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
