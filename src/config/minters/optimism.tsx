import { MinterConfig } from '../../features/data/apis/config-types';

export const minters: MinterConfig[] = [
  {
    id: 'beOPX',
    name: 'beOPX',
    contractAddress: '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
    depositToken: {
      symbol: 'OPX',
      oracleId: 'OPX',
      type: 'erc20',
      contractAddress: '0xcdB4bB51801A1F399d4402c61bC098a72c382E65',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beOPX',
      oracleId: 'beOPX',
      type: 'erc20',
      contractAddress: '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
      decimals: 18,
    },
    canBurnReserves: true,
    hasEarningsPool: true,
    reserveBalanceMethod: 'withdrawableBalance',
    vaultIds: ['beefy-beopx', 'beefy-beopx-earnings'],
  },
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
