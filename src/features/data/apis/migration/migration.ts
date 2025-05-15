import type { MigrationConfig } from '../../reducers/wallet/migration-types.ts';
import type { IMigrationApi, Migrator } from './migration-types.ts';

const migrators: MigrationConfig['id'][] = [
  'bera-infrared',
  'bera-kodiak',
  // 'ethereum-conic',
  'ethereum-convex',
  'ethereum-curve',
  'l2-convex',
  'l2-curve',
  // 'ethereum-prisma',
  // 'polygon-pearl',
  'magpie',
  // 'real-pearl',
  'sonic-swapx',
];

export class MigrationApi implements IMigrationApi {
  public async getMigrator(id: MigrationConfig['id']): Promise<Migrator> {
    if (migrators.includes(id)) {
      return (await import(`./${id}/migrator.ts`)).migrator as Migrator; // TODO import glob?
    } else {
      throw new Error(`${id} not found`);
    }
  }
}
