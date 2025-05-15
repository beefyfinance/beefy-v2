import type { MigrationConfig } from '../../features/data/reducers/wallet/migration-types.ts';

export const migrators = [
  {
    id: 'ethereum-conic',
    name: 'Conic Finance',
    icon: 'CNC',
  },
  {
    id: 'ethereum-convex',
    name: 'Convex',
    icon: 'CVX',
  },
  {
    id: 'ethereum-curve',
    name: 'Curve',
    icon: 'CRV',
  },
  {
    id: 'ethereum-prisma',
    name: 'Prisma',
    icon: 'PRISMA',
  },
  {
    id: 'magpie',
    name: 'Magpie',
    icon: 'mPENDLE',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
