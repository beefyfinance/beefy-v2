import type { BaseMigrationConfig } from '../config-types';
import type { Migrator, IMigrationApi } from './migration-types';

const migrators: BaseMigrationConfig['id'][] = ['ethereum-conic'];

export class MigrationApi implements IMigrationApi {
  public async getMigrator(id: BaseMigrationConfig['id']): Promise<Migrator> {
    if (migrators.includes(id)) {
      //vite don't allow ${id}.ts, need to follow the following something-${id}.ts
      //for more information see https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
      return (await import(`./migrator-${id}.ts`)).migrator;
    } else {
      throw new Error(`${id} not found`);
    }
  }
}
