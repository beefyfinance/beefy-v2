import type { MinterConfig } from '../../features/data/apis/config-types.ts';

export const minters: MinterConfig[] = [
  {
    id: 'beftm',
    name: 'beFTM',
    minterAddress: '0xD42Db865A8e78ebF9F7C081Bc0A4fDD4314b5fEf',
    burnerAddress: '0x7381eD41F6dE418DdE5e84B55590422a57917886',
    depositToken: {
      symbol: 'FTM',
      oracleId: 'FTM',
      contractAddress: 'native',
      type: 'native',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beFTM',
      oracleId: 'beFTM',
      type: 'erc20',
      contractAddress: '0x7381eD41F6dE418DdE5e84B55590422a57917886',
      decimals: 18,
    },
    disableMint: true,
    canZapInWithOneInch: true,
    canBurn: 'supply',
    reserveBalanceMethod: 'balanceOfWant',
    vaultIds: [
      'beefy-beFTM',
      'beefy-beFTM-earnings',
      'spirit-ftm-beftm',
      'boo-wftm-beftm',
      'beets-beefy-tale',
    ],
  },
  {
    id: 'binspirit',
    name: 'binSPIRIT',
    minterAddress: '0x8b32B01C740df5bd1fDa081BD3b12FB9200cb4Bc',
    depositToken: {
      symbol: 'SPIRIT',
      oracleId: 'SPIRIT',
      type: 'erc20',
      contractAddress: '0x5Cc61A78F164885776AA610fb0FE1257df78E59B',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'binSPIRIT',
      oracleId: 'binSPIRIT',
      type: 'erc20',
      contractAddress: '0x44e314190D9E4cE6d4C0903459204F8E21ff940A',
      decimals: 18,
    },
    canBurn: false,
    vaultIds: ['beefy-binspirit', 'spirit-binspirit-spirit'],
  },
];
