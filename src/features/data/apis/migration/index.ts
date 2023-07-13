import type { BaseMigrationConfig } from '../config-types';
import type { Migrator, IMigrationApi } from './migration-types';

const migrators: BaseMigrationConfig['id'][] = ['ethereum-conic'];

export class MigrationApi implements IMigrationApi {
  public async getMigrator(id: BaseMigrationConfig['id']): Promise<Migrator> {
    if (migrators.includes(id)) {
      return (await import(`./${id}/migrator.ts`)).migrator;
    } else {
      throw new Error(`${id} not found`);
    }
  }
}
