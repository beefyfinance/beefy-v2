import type { MigrationConfig } from '../../features/data/reducers/wallet/migration-types.ts';

export const migrators = [
  {
    id: 'sonic-swapx',
    name: 'SwapX',
    icon: 'SWPx',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
