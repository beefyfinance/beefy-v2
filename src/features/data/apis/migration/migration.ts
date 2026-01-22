import type { IMigrationApi, Migrator } from './migration-types.ts';

const migratorsMap = import.meta.glob<Migrator>('./migrators/*.ts', {
  eager: false,
  import: 'migrator',
});

export class MigrationApi implements IMigrationApi {
  public async getMigrator(id: string): Promise<Migrator> {
    const importFn = migratorsMap[`./migrators/${id}.ts`];
    if (importFn) {
      return await importFn();
    } else {
      throw new Error(`${id} not found`);
    }
  }
}
