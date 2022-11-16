import { OneInchZapConfig } from '../../features/data/apis/config-types';

export const zaps: OneInchZapConfig[] = [
  {
    zapAddress: '0x41e2F0104B7237CBFC0238d902Ef37a07Be068A5',
    chainId: 'polygon',
    depositFromTokens: ['MATIC', 'WMATIC', 'USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    blockedDepositToTokens: ['S*USDC', 'S*USDT', 'beQI'],
    withdrawToTokens: ['MATIC', 'BIFI', 'USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    blockedWithdrawFromTokens: ['S*USDC', 'S*USDT', 'beQI'],
  },
];
