import { MinterConfig } from '../../features/data/apis/config-types';

export const minters: MinterConfig[] = [
  {
    id: 'beVELO',
    name: 'beVELO',
    contractAddress: '0xfDeFFc7Ad816BF7867C642dF7eBC2CC5554ec265',
    depositToken: {
      symbol: 'VELO',
      oracleId: 'VELO',
      type: 'erc20',
      contractAddress: '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beVELO',
      oracleId: 'beVELO',
      type: 'erc20',
      contractAddress: '0xfDeFFc7Ad816BF7867C642dF7eBC2CC5554ec265',
      decimals: 18,
    },
    canBurnReserves: true,
    hasEarningsPool: false,
    reserveBalanceMethod: 'withdrawableBalance',
    vaultIds: ['beefy-bevelo'],
  },
];
