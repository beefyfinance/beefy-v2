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
  {
    zapAddress: '0x1F4846092FD8B5D0858F3737Ed22D3fc43f1969e',
    chainId: 'fantom',
    depositFromTokens: ['FTM', 'WFTM', 'USDC', 'fUSDT', 'DAI', 'WETH', 'WBTC'],
    blockedDepositToTokens: ['S*USDC'],
    withdrawToTokens: ['FTM', 'BIFI', 'USDC', 'fUSDT', 'DAI', 'WETH', 'WBTC'],
    blockedWithdrawFromTokens: ['S*USDC'],
  },
];
