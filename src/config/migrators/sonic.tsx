import type { MigrationConfig } from '../../features/data/reducers/wallet/migration';

export const migrators = [
  {
    id: 'sonic-swapx',
    name: 'SwapX',
    icon: 'SWPx',
  },
] as const satisfies ReadonlyArray<MigrationConfig>;
