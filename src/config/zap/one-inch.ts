import { OneInchZapConfig } from '../../features/data/apis/config-types';
import { ZapFee } from '../../features/data/apis/transact/transact-types';

// Note: Applying fee not yet implemented
const fee: ZapFee = {
  original: 0.05 / 100, // 0.05%
  discounted: 0,
};

export const zaps: OneInchZapConfig[] = [
  {
    zapAddress: '0xF815E5f5Ed70f8a88F5f17a5a3F4f1C9c829776B',
    chainId: 'polygon',
    fee,
    depositFromTokens: ['MATIC', 'WMATIC', 'USDC', 'USDT', 'DAI', 'MAI', 'ETH', 'WBTC'],
    withdrawToTokens: ['MATIC', 'BIFI', 'USDC', 'USDT', 'DAI', 'MAI', 'ETH', 'WBTC'],
    blockedTokens: [
      '2BRZ', // no 1inch price
      '4EUR', // no 1inch liquidity
      'bbamDAI', // no 1inch price
      'bbamUSD', // no 1inch price
      'bbamUSDC', // no 1inch price
      'bbamUSDT', // no 1inch price
      'beQI', // no 1inch liquidity
      'CADC', // beefy and 1inch prices are more than 10% different
      'cxADA', // no 1inch liquidity
      'cxBTC', // beefy and 1inch prices are more than 10% different
      'cxDOGE', // no 1inch liquidity
      'DOKI', // no 1inch price
      'FTM', // beefy and 1inch prices are more than 10% different
      'ibBTC', // beefy and 1inch prices are more than 10% different
      'jBRL', // no 1inch price
      'jCAD', // no 1inch liquidity
      'jCHF', // beefy and 1inch prices are more than 10% different
      'jGBP', // beefy and 1inch prices are more than 10% different
      'jJPY', // no 1inch liquidity
      'jNZD', // no 1inch liquidity
      'JPYC', // beefy and 1inch prices are more than 10% different
      'jSGD', // no 1inch liquidity
      'NEXO', // beefy and 1inch prices are more than 10% different
      'NZDS', // beefy and 1inch prices are more than 10% different
      'pBREW', // beefy and 1inch prices are more than 10% different
      'PEAR', // beefy and 1inch prices are more than 10% different
      'PZAP', // no 1inch liquidity
      'S*USDC', // no 1inch liquidity
      'S*USDT', // no 1inch liquidity
      'SOLACE', // no 1inch liquidity
      'TOMB', // beefy and 1inch prices are more than 10% different
      'WATCH', // beefy and 1inch prices are more than 10% different
      'WFIL', // beefy and 1inch prices are more than 10% different
      'xMARK', // beefy and 1inch prices are more than 10% different
      'XSGD', // beefy and 1inch prices are more than 10% different
    ],
    blockedVaults: [],
  },
  {
    zapAddress: '0xddcAF38D2Ae216f7B86af7A12A174CbE168B034b',
    chainId: 'fantom',
    fee,
    depositFromTokens: ['FTM', 'WFTM', 'USDC', 'fUSDT', 'DAI', 'MIM', 'MAI', 'WETH', 'WBTC'],
    withdrawToTokens: ['FTM', 'BIFI', 'USDC', 'fUSDT', 'DAI', 'MIM', 'MAI', 'WETH', 'WBTC'],
    blockedTokens: [
      'alUSD', // no 1inch price
      'asUSDC', // no 1inch price
      'ATLAS', // no 1inch liquidity
      'BASED', // no 1inch liquidity
      'binSPIRIT', // no 1inch liquidity
      'COVER', // no 1inch liquidity
      'DEI', // beefy and 1inch prices are more than 10% different
      'DOLA', // no 1inch liquidity
      'FTML', // no 1inch liquidity
      'fWINGS', // beefy and 1inch prices are more than 10% different
      'LUNA', // beefy and 1inch prices are more than 10% different
      'LUNAw', // no 1inch liquidity
      'PEAR', // beefy and 1inch prices are more than 10% different
      'POTS', // no 1inch liquidity
      'S*USDC', // no 1inch liquidity
      'SHADE', // no 1inch liquidity
      'SOL', // beefy and 1inch prices are more than 10% different
      'SOLACE', // no 1inch liquidity
      'SOLID', // beefy and 1inch prices are more than 10% different
      'sSPELL', // no 1inch liquidity
      'STEAK', // no 1inch liquidity
      'SUMMIT', // no 1inch liquidity
      'USDB', // beefy and 1inch prices are more than 10% different
      'USDL', // no 1inch liquidity
      'UST', // no 1inch liquidity
      'USTaxl', // no 1inch liquidity
      'WOOFY', // no 1inch liquidity
      'xSCREAM', // no 1inch liquidity
      'ZOO', // no 1inch liquidity
    ],
    blockedVaults: ['geist-ftm'],
  },
  {
    zapAddress: '0x7B4d6d79DE44Fe034f75BD4525a13aaEFAF4597F',
    chainId: 'optimism',
    fee,
    depositFromTokens: ['ETH', 'WETH', 'OP', 'USDC', 'USDT', 'DAI', 'MAI', 'sUSD', 'sETH', 'WBTC'],
    withdrawToTokens: ['ETH', 'OP', 'BIFI', 'USDC', 'USDT', 'DAI', 'MAI', 'sUSD', 'sETH', 'WBTC'],
    blockedTokens: [
      'alUSD', // no 1inch price
      'bbDAI+', // no 1inch price
      'bbrfaUSD', // no 1inch price
      'bbrfaWBTC', // no 1inch price
      'bbrfaWETH', // no 1inch price
      'bbUSD+', // no 1inch price
      'beOPX', // no 1inch liquidity
      'beVELO', // no 1inch liquidity
      'DAI-hDAI LP', // no 1inch liquidity
      'ETH-hETH LP', // no 1inch liquidity
      'frxETH', // no 1inch price
      'jEUR', // no 1inch liquidity
      'MIM', // no 1inch price
      'S*DAI', // no 1inch liquidity
      'S*ETH', // no 1inch liquidity
      'S*FRAX', // no 1inch liquidity
      'S*USDC', // no 1inch liquidity
      'SNX-hSNX LP', // no 1inch liquidity
      'TUSD', // no 1inch price
      'USD+', // no 1inch price
      'USDC-hUSDC LP', // beefy and 1inch prices are more than 10% different
      'USDT-hUSDT LP', // no 1inch price
      'USX', // no 1inch price
    ],
    blockedVaults: ['aavev3-op-eth'],
  },
  {
    zapAddress: '0x4B0A66dEe9ff557f9b0c25c3e57086495f570e65',
    chainId: 'avax',
    fee,
    depositFromTokens: [
      'AVAX',
      'WAVAX',
      'USDC',
      'USDCe',
      'USDT',
      'USDTe',
      'DAIe',
      'MIM',
      'MAI',
      'WETHe',
      'WBTCe',
    ],
    withdrawToTokens: [
      'AVAX',
      'BIFI',
      'USDC',
      'USDCe',
      'USDT',
      'USDTe',
      'DAIe',
      'MIM',
      'MAI',
      'WETHe',
      'WBTCe',
    ],
    blockedTokens: [
      'AVAXL', // no 1inch liquidity
      'beJOE', // no 1inch liquidity
      'COM', // beefy and 1inch prices are more than 10% different
      'DAI', // beefy and 1inch prices are more than 10% different (old bridge, not DAI.e)
      'DOMI', // beefy and 1inch prices are more than 10% different
      'ETH', // beefy and 1inch prices are more than 10% different (old bridge, not WETH.e)
      'FIEF', // no 1inch liquidity
      'LINK', // beefy and 1inch prices are more than 10% different
      'OLIVE', // beefy and 1inch prices are more than 10% different
      'S*USDC', // no 1inch liquidity
      'S*USDT', // no 1inch liquidity
      'SUSHI', // beefy and 1inch prices are more than 10% different
      'WINE', // no 1inch liquidity
    ],
    blockedVaults: ['aavev3-avax'],
  },
  {
    zapAddress: '0xb80318Aab313D54274358EEC637f18aFfd03DF8b',
    chainId: 'arbitrum',
    fee,
    depositFromTokens: ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'MIM', 'WBTC'],
    withdrawToTokens: ['ETH', 'BIFI', 'USDC', 'USDT', 'DAI', 'MIM', 'WBTC'],
    blockedTokens: [
      'agEUR', // no 1inch price
      'FISH', // no 1inch price
      'MAI', // no 1inch price
      'S*ETH', // no 1inch liquidity
      'S*USDC', // no 1inch liquidity
      'S*USDT', // no 1inch liquidity
      'USDD', // no 1inch liquidity
      'USX', // no 1inch price
      'VST', // beefy and 1inch prices are more than 10% different
    ],
    blockedVaults: [],
  },
  {
    zapAddress: '0xD586Fc2cD0075e272142B76192a17693c4662fc4',
    chainId: 'bsc',
    fee,
    depositFromTokens: ['BNB', 'WBNB', 'BUSD', 'USDC', 'USDT', 'DAI', 'ETH', 'BTCB'],
    withdrawToTokens: ['BNB', 'BIFI', 'BUSD', 'USDC', 'USDT', 'DAI', 'ETH', 'BTCB'],
    blockedTokens: [
      'aBNBc', // beefy and 1inch prices are more than 10% different
      'AURO', // no 1inch liquidity
      'bDIGG', // beefy and 1inch prices are more than 10% different
      'beltBNB', // beefy and 1inch prices are more than 10% different
      'beltBTC', // no 1inch liquidity
      'beltETH', // beefy and 1inch prices are more than 10% different
      'BRZw', // no 1inch liquidity
      'BSHARE', // beefy and 1inch prices are more than 10% different
      'CARROT', // beefy and 1inch prices are more than 10% different
      'CONE', // beefy and 1inch prices are more than 10% different
      'CRUSH', // beefy and 1inch prices are more than 10% different
      'DFT', // beefy and 1inch prices are more than 10% different
      'FISH', // no 1inch liquidity
      'frxETH', // no 1inch price
      'FROYO', // beefy and 1inch prices are more than 10% different
      'GOAL', // no 1inch liquidity
      'GOLD', // no 1inch liquidity
      'GOLDCOIN', // no 1inch liquidity
      'GUARD', // beefy and 1inch prices are more than 10% different
      'HEC', // beefy and 1inch prices are more than 10% different
      'ibALPACA', // no 1inch liquidity
      'ICA', // beefy and 1inch prices are more than 10% different
      'IRON', // beefy and 1inch prices are more than 10% different
      'jBRL', // no 1inch liquidity
      'jCHF', // no 1inch liquidity
      'LONG', // no 1inch liquidity
      'mCOIN', // no 1inch liquidity
      'OOE', // no 1inch liquidity
      'PAE', // beefy and 1inch prices are more than 10% different
      'PALM', // no 1inch liquidity
      'pBNB', // beefy and 1inch prices are more than 10% different
      'QI', // beefy and 1inch prices are more than 10% different
      'S*BUSD', // beefy and 1inch prices are more than 10% different
      'S*USDT', // beefy and 1inch prices are more than 10% different
      'sALPACA', // no 1inch liquidity
      'SALT', // no 1inch liquidity
      'SWTH', // no 1inch liquidity
      'TEN', // no 1inch liquidity
      'TOFY', // no 1inch liquidity
      'XMARK', // no 1inch liquidity
      'ZBTC', // no 1inch liquidity
    ],
    blockedVaults: ['venus-bnb', 'venus-wbnb'],
  },
  {
    zapAddress: '0x6b7886D72436522CE9664b5d77B6745f1A726C96',
    chainId: 'aurora',
    fee,
    depositFromTokens: ['ETH', 'WETH', 'USDC', 'USDT', 'WBTC'],
    withdrawToTokens: ['ETH', 'BIFI', 'USDC', 'USDT', 'WBTC'],
    blockedTokens: [
      'MAI', // beefy and 1inch prices are more than 10% different
    ],
    blockedVaults: [],
  },
  {
    zapAddress: '0x46c7308567B527647853d3F94d40Ce82ed27f325',
    chainId: 'ethereum',
    fee,
    depositFromTokens: ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'MIM'],
    withdrawToTokens: ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'MIM'],
    blockedTokens: [
      'alETH', // no 1inch price
      'ApeUSD', // no 1inch price
      'BAL-WETH-80-20', // no 1inch liquidity
      'bbaDAI', // no 1inch price
      'bbaUSD', // no 1inch price
      'bbaUSDC', // no 1inch price
      'bbaUSDT', // no 1inch price
      'BIFI', // no 1inch price
      'cvxFXS', // no 1inch liquidity
      'frxETH', // no 1inch price
      'INV', // beefy and 1inch prices are more than 10% different
      'MAI', // no 1inch price
      'multiBTC', // no 1inch price
      'pETH', // no 1inch liquidity
      'S*ETH', // no 1inch liquidity
      'S*USDC', // no 1inch liquidity
      'S*USDT', // no 1inch liquidity
      'sfrxETH', // no 1inch price
    ],
    blockedVaults: [],
  },
];
