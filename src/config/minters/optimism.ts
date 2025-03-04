import type { MinterConfig } from '../../features/data/apis/config-types.ts';

export const minters: MinterConfig[] = [
  {
    id: 'beOPX',
    name: 'beOPX',
    minterAddress: '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
    burnerAddress: '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
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
    canBurn: 'reserves',
    reserveBalanceMethod: 'withdrawableBalance',
    vaultIds: ['beefy-beopx', 'beefy-beopx-earnings'],
  },
];
