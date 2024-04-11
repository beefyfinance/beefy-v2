import type { MinterConfig } from '../../features/data/apis/config-types';

export const minters: MinterConfig[] = [
  {
    id: 'bejoe',
    name: 'beJoe',
    minterAddress: '0x1F2A8034f444dc55F963fb5925A9b6eb744EeE2c',
    burnerAddress: '0x1F2A8034f444dc55F963fb5925A9b6eb744EeE2c',
    depositToken: {
      symbol: 'JOE',
      oracleId: 'JOE',
      type: 'erc20',
      contractAddress: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beJOE',
      oracleId: 'beJOE',
      type: 'erc20',
      contractAddress: '0x1F2A8034f444dc55F963fb5925A9b6eb744EeE2c',
      decimals: 18,
    },
    canBurn: 'reserves',
    reserveBalanceMethod: 'balanceOfWant',
    vaultIds: ['beefy-beJoe-earnings', 'beefy-beJoe'],
  },
];
