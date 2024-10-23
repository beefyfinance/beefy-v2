import type { MinterConfig } from '../../features/data/apis/config-types';

export const minters: MinterConfig[] = [
  {
    id: 'besnars',
    name: 'besnARS',
    minterAddress: '0xf95aFD81727ca7a98E4d56b2D699148BDC1ed7Bd',
    burnerAddress: '0xf95aFD81727ca7a98E4d56b2D699148BDC1ed7Bd',
    depositToken: {
      symbol: 'snARS',
      oracleId: 'snARS',
      type: 'erc20',
      contractAddress: '0xC1F4C75e8925A67BE4F35D6b1c044B5ea8849a58',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'besnARS',
      oracleId: 'besnARS',
      type: 'erc20',
      contractAddress: '0xf95aFD81727ca7a98E4d56b2D699148BDC1ed7Bd',
      decimals: 18,
    },
    canBurn: 'supply',
    reserveBalanceMethod: 'balance',
    vaultIds: ['beefy-snars-pool'],
  },
];
