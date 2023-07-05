import type { MigratorConfig } from '../../features/data/apis/config-types';

export const migrators: MigratorConfig[] = [
  {
    migrationId: 'ethereum-conic',
    vaultIds: {
      'conic-crvusd': '0x369cbc5c6f139b1132d3b91b87241b37fc5b971f',
      'conic-usdc': '0x07b577f10d4e00f3018542d08a87f255a49175a5',
    },
  },
];
