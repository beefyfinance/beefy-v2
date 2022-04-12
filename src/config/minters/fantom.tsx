export const minters = [
  {
    id: 'beftm',
    name: 'beFTM',
    contractAddress: '0x34753f36d69d00e2112Eb99B3F7f0FE76cC35090',
    depositToken: {
      symbol: 'FTM',
      oracleId: 'FTM',
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
    canBurnWithReserves: false,
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
    contractAddress: '0x8b32B01C740df5bd1fDa081BD3b12FB9200cb4Bc',
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
    canBurnWithReserves: false,
    vaultIds: ['beefy-binspirit', 'spirit-binspirit-spirit'],
  },
];
