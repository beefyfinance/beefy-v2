import type { MinterConfig } from '../../features/data/apis/config-types.ts';

export const minters: MinterConfig[] = [
  {
    id: 'beqi',
    name: 'beQI',
    minterAddress: '0x309116fBDb516F64e6cb39874f6f27Ba9B7fF304',
    burnerAddress: '0x309116fBDb516F64e6cb39874f6f27Ba9B7fF304',
    depositToken: {
      symbol: 'QI BPT',
      oracleId: 'beQIv2',
      type: 'erc20',
      contractAddress: '0x39eB558131E5eBeb9f76a6cbf6898f6E6DCe5e4E',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beQI',
      oracleId: 'beQIv2',
      type: 'erc20',
      contractAddress: '0x6c9D885B37b131aa68794ee1549fFB80be381Fa9',
      decimals: 18,
    },
    canBurn: 'reserves',
    reserveBalanceMethod: 'withdrawableBalance',
    vaultIds: ['beqiv2-pool'],
  },
];
