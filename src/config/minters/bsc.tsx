export const minters = [
  {
    id: 'becake',
    name: 'beCAKE',
    contractAddress: '0x42b50A901228fb4C739C19fcd38DC2182B515B66',
    depositToken: {
      symbol: 'CAKE',
      oracleId: 'Cake',
      type: 'erc20',
      contractAddress: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beCAKE',
      oracleId: 'beCAKE',
      type: 'erc20',
      contractAddress: '0x42b50A901228fb4C739C19fcd38DC2182B515B66',
      decimals: 18,
    },
    canBurnReserves: true,
    reserveBalanceMethod: 'withdrawableBalance',
    vaultIds: ['cake-cakev2'],
  },
];
