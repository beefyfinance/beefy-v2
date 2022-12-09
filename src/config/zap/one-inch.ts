import { OneInchZapConfig } from '../../features/data/apis/config-types';

export const zaps: OneInchZapConfig[] = [
  {
    zapAddress: '0xd2154257Ec830610b609b13056340564f85F2f86',
    chainId: 'polygon',
    depositFromTokens: ['MATIC', 'WMATIC', 'USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    blockedDepositToTokens: ['S*USDC', 'S*USDT', 'beQI'],
    withdrawToTokens: ['MATIC', 'BIFI', 'USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    blockedWithdrawFromTokens: ['S*USDC', 'S*USDT', 'beQI'],
  },
];
