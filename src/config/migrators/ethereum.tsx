import type { MigrationConfig } from '../../features/data/reducers/wallet/migration';

export const migrators: MigrationConfig[] = [
  {
    id: 'ethereum-conic',
    name: 'Conic Finance',
    icon: 'CNC',
    vaultIds: ['conic-crvusd', 'conic-usdc', 'conic-eth'],
  },
];
