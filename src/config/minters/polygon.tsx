import { MinterConfig } from '../../features/data/apis/config-types';

export const minters: MinterConfig[] = [
  {
    id: 'beqi',
    name: 'beQI',
    contractAddress: '0x97bfa4b212A153E15dCafb799e733bc7d1b70E72',
    depositToken: {
      symbol: 'QI',
      oracleId: 'QI',
      type: 'erc20',
      contractAddress: '0x580A84C73811E1839F75d86d75d88cCa0c241fF4',
      decimals: 18,
    },
    mintedToken: {
      symbol: 'beQI',
      oracleId: 'beQI',
      type: 'erc20',
      contractAddress: '0x97bfa4b212A153E15dCafb799e733bc7d1b70E72',
      decimals: 18,
    },
    canBurnReserves: true,
    hasEarningsPool: true,
    reserveBalanceMethod: 'withdrawableBalance',
    vaultIds: ['beefy-beqi', 'beefy-beqi-earnings'],
  },
];
