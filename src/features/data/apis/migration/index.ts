import type { MigrationConfig } from '../../reducers/wallet/migration';
import type { Migrator, IMigrationApi } from './migration-types';

const migrators: MigrationConfig['id'][] = ['ethereum-conic', 'polygon-pearl'];

export class MigrationApi implements IMigrationApi {
  public async getMigrator(id: MigrationConfig['id']): Promise<Migrator> {
    if (migrators.includes(id)) {
      return (await import(`./${id}/migrator.ts`)).migrator;
    } else {
      throw new Error(`${id} not found`);
    }
  }
}
