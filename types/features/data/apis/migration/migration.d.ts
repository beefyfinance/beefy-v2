import type { IMigrationApi, Migrator } from './migration-types';
export declare class MigrationApi implements IMigrationApi {
    getMigrator(id: string): Promise<Migrator>;
}
