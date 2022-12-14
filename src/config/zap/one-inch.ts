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
    blockedDepositToTokens: ['S*USDC', 'binSPIRIT'],
    withdrawToTokens: ['FTM', 'BIFI', 'USDC', 'fUSDT', 'DAI', 'WETH', 'WBTC'],
    blockedWithdrawFromTokens: ['S*USDC', 'binSPIRIT'],
  },
  {
    zapAddress: '0x3983C50fF4CD25b43A335D63839B1E36C7930D41',
    chainId: 'optimism',
    depositFromTokens: ['ETH', 'WETH', 'OP', 'USDC', 'USDT', 'DAI', 'WBTC'],
    blockedDepositToTokens: [],
    withdrawToTokens: ['ETH', 'OP', 'BIFI', 'USDC', 'USDT', 'DAI', 'WBTC'],
    blockedWithdrawFromTokens: [],
  },
  {
    zapAddress: '0xdFCC0FE31568cB3c75A20f41A8fD705BF951538c',
    chainId: 'avax',
    depositFromTokens: ['AVAX', 'WAVAX', 'USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    blockedDepositToTokens: [],
    withdrawToTokens: ['AVAX', 'BIFI', 'USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    blockedWithdrawFromTokens: [],
  },
  {
    zapAddress: '0xef46Ea3e79C2D75A6BCB8BA7a3869d9a6E54258B',
    chainId: 'arbitrum',
    depositFromTokens: ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC'],
    blockedDepositToTokens: [],
    withdrawToTokens: ['ETH', 'BIFI', 'USDC', 'USDT', 'DAI', 'WBTC'],
    blockedWithdrawFromTokens: [],
  },
  {
    zapAddress: '0x60Fe376921e92F9560811Fc96893261a4F79AE5F',
    chainId: 'bsc',
    depositFromTokens: ['BNB', 'WBNB', 'BUSD', 'USDC', 'USDT', 'DAI', 'ETH', 'BTCB'],
    blockedDepositToTokens: [],
    withdrawToTokens: ['BNB', 'BIFI', 'BUSD', 'USDC', 'USDT', 'DAI', 'ETH', 'BTCB'],
    blockedWithdrawFromTokens: [],
  },
];
