import type { MigrationConfig } from '../../features/data/reducers/wallet/migration';

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
    id: 'ethereum-prisma',
    name: 'Prisma',
    icon: 'PRISMA',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
