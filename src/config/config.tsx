import type { ChainConfig } from '../features/data/apis/config-types';
import type { ChainEntity } from '../features/data/entities/chain';

export const config = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpc: ['https://rpc.ankr.com/eth'],
    explorerUrl: 'https://etherscan.io',
    multicallAddress: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x00d3e26d17aEA6f5c7d2f442aAc68E679E454517',
    providerName: 'Ethereum',
    walletSettings: {
      chainId: `0x${parseInt('1', 10).toString(16)}`,
      chainName: 'ethereum',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.ankr.com/eth'],
      blockExplorerUrls: ['https://etherscan.io/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      priorityMinimum: '1000000000',
      baseSafetyMargin: 0.1,
    },
    stableCoins: [
      'USDC',
      'DAI',
      'USDT',
      'FRAX',
      'DOLA',
      'USDD',
      'alUSD',
      'TUSD',
      'GUSD',
      'BUSD',
      'LUSD',
      'sUSD',
      'MIM',
      'ApeUSD',
      'bbaUSDC',
      'bbaUSDT',
      'bbaDAI',
      'bbaUSD',
      'MAI',
      'sethUSDC',
      'sethUSDT',
      'eUSD',
      'lvUSD',
      'crvUSD',
      'mkUSD',
      'sDAI',
      'sFRAX',
      'R',
      'GHO',
      'bbsDAI',
      'hyUSD',
      'sDAI',
      'bpt3POOL',
      'USDC+',
      'PYUSD',
      'ULTRA',
    ],
  },
  polygon: {
    name: 'Polygon PoS',
    chainId: 137,
    rpc: ['https://polygon-rpc.com'],
    explorerUrl: 'https://polygonscan.com',
    multicallAddress: '0xC3821F0b56FA4F4794d5d760f94B812DE261361B',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x244908D9A21B143911D531cD1D37575D63da4D87',
    providerName: 'polygon',
    walletSettings: {
      chainId: `0x${parseInt('137', 10).toString(16)}`,
      chainName: 'Polygon PoS',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      priorityMinimum: '1000000000',
      baseSafetyMargin: 0.1,
    },
    stableCoins: [
      'USDC',
      'USDT',
      'maUSDC',
      'DAI',
      'IRON',
      'MAI',
      'FRAX',
      'rUSD',
      'UST',
      'WUSD',
      'jEUR',
      'jGBP',
      'jCHF',
      'EURt',
      'TUSD',
      'PAR',
      'EURS',
      '4EUR',
      'agEUR',
      'jJPY',
      'JPYC',
      'jCAD',
      'CADC',
      'jSGD',
      'XSGD',
      'EURe',
      'USD+',
      'bbamUSDC',
      'bbamDAI',
      'bbamUSDT',
      'BRZ',
      'jBRL',
      '2BRZ',
      'bbamUSD',
      'axlUSDC',
      'CASH',
      'BOB',
      'crvUSD',
      'pUSDCe',
    ],
  },
  bsc: {
    name: 'BNB Chain',
    chainId: 56,
    rpc: [
      'https://rpc.ankr.com/bsc',
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
    ],
    explorerUrl: 'https://bscscan.com',
    multicallAddress: '0xB94858b0bB5437498F5453A16039337e5Fdc269C',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x72580937d2B5563792793e72200fC8942a4045D6',
    providerName: 'binance',
    walletSettings: {
      chainId: `0x${parseInt('56', 10).toString(16)}`,
      chainName: 'BSC Mainnet',
      nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: ['https://bsc-dataseed.binance.org'],
      blockExplorerUrls: ['https://bscscan.com/'],
    },
    gas: {
      type: 'standard',
      minimum: '3000000000',
    },
    stableCoins: [
      'BUSD',
      'USDT',
      'USDC',
      'DAI',
      'VAI',
      'QUSD',
      'UST',
      'VENUS BLP',
      '3EPS',
      'fUSDT',
      '4BELT',
      'IRON',
      'DOLLY',
      'TUSD',
      'USDN',
      'WUSD',
      'USDO',
      'sbBUSD',
      'sbUSDT',
      'FRAX',
      'USDD',
      'MAI',
      'jBRL',
      'BRZ',
      'BRZw',
      'USD+',
      'HAY',
      'jCHF',
      'TOR',
      'ETSAlpha',
      'DOLA',
      'USDT+',
      'vUSDT',
    ],
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    rpc: ['https://mainnet.optimism.io'],
    explorerUrl: 'https://optimistic.etherscan.io',
    multicallAddress: '0x820ae7bf39792d7ce7befc70b0172f4d267f1938',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x88D537a86e09B753361D70448d60D3dC2D75883d',
    providerName: 'Optimism',
    walletSettings: {
      chainId: `0x${parseInt('10', 10).toString(16)}`,
      chainName: 'Optimism',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.optimism.io'],
      blockExplorerUrls: ['https://optimistic.etherscan.io/'],
    },
    gas: {
      type: 'standard',
      minimum: '1000000',
    },
    stableCoins: [
      'USDC',
      'sUSD',
      'DAI',
      'USDT',
      'MAI',
      'FRAX',
      'LUSD',
      'alUSD',
      'DOLA',
      'soUSDC',
      'USD+',
      'MIM',
      'bbrfaUSD',
      'agEUR',
      'jEUR',
      'TUSD',
      'USX',
      'sEUR',
      'bbUSD+',
      'bbDAI+',
      'DAI+',
      'BOB',
      'wTBT',
      'opUSDCe',
      'wUSD+',
      'USDR',
      'wUSDR',
      'omultiwUSDR',
      'sFRAX',
      'crvUSD',
    ],
  },
  fantom: {
    name: 'Fantom',
    chainId: 250,
    rpc: ['https://rpc.ankr.com/fantom'],
    explorerUrl: 'https://ftmscan.com',
    multicallAddress: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xdd54c53d169aCFC53cAf08F1778A492Ff5Aea258',
    providerName: 'fantom',
    walletSettings: {
      chainId: `0x${parseInt('250', 10).toString(16)}`,
      chainName: 'Fantom Opera',
      nativeCurrency: {
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.ankr.com/fantom'],
      blockExplorerUrls: ['https://ftmscan.com/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      priorityMinimum: '1000000000',
      baseSafetyMargin: 0.1,
    },
    stableCoins: [
      'USDC',
      'USDT',
      'DAI',
      'fUSDT',
      'MIM',
      'FRAX',
      'MAI',
      'DOLA',
      'TUSD',
      'UST',
      'asUSDC',
      'LAMBDA',
      'sfUSDC',
      'USTw',
      'USTaxl',
      'USDL',
      'TOR',
      'BUSD',
      'alUSD',
      'axlUSDC',
      'lzUSDC',
      'lzUSDT',
    ],
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    rpc: ['https://arb1.arbitrum.io/rpc'],
    explorerUrl: 'https://arbiscan.io',
    multicallAddress: '0x13aD51a6664973EbD0749a7c84939d973F247921',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x332f4079E042A5764060E24C72DE765c8Ea1BC95',
    providerName: 'Arbitrum',
    walletSettings: {
      chainId: `0x${parseInt('42161', 10).toString(16)}`,
      chainName: 'Arbitrum One',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
    },
    stableCoins: [
      'USDC',
      'USDT',
      'MIM',
      'VST',
      'DAI',
      'sarUSDC',
      'sarUSDT',
      'FRAX',
      'USX',
      'MAI',
      'USDD',
      'TUSD',
      'agEUR',
      'LUSD',
      'DOLA',
      'USD+',
      'DAI+',
      'gDAI',
      'jEUR',
      'arbUSDCe',
      'bbaaUSDC',
      'bbaaUSDT',
      'bbaaDAI',
      'bbaaUSD',
      'bbaaUSDTV2',
      'bbaaUSDCV2',
      'bbaaDAIV2',
      'aArbUSDCn',
      'cArbUSDCv3',
      'crvUSD',
      'arbwUSD+',
      'sFRAX',
      'bpt4POOL',
      'USDT+',
    ],
  },
  avax: {
    name: 'Avalanche',
    chainId: 43114,
    rpc: ['https://rpc.ankr.com/avalanche'],
    explorerUrl: 'https://cchain.explorer.avax.network',
    multicallAddress: '0x6FfF95AC47b586bDDEea244b3c2fe9c4B07b9F76',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x911E556Afd49468429072A3677f895B3cE0AcCcB',
    providerName: 'avalanche',
    walletSettings: {
      chainId: `0x${parseInt('43114', 10).toString(16)}`,
      chainName: 'Avalanche C-Chain',
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.ankr.com/avalanche'],
      blockExplorerUrls: ['https://cchain.explorer.avax.network/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      priorityMinimum: '1000000000',
      baseSafetyMargin: 0.1,
    },
    stableCoins: [
      'USDT',
      'DAI',
      'BUSD',
      'zDAI',
      'zUSDT',
      'USDTe',
      'BUSDe',
      'USDC',
      'USDCe',
      'DAIe',
      'MAI',
      'FRAX',
      'nUSD',
      'MIM',
      'UST',
      'saUSDT',
      'saUSDC',
      'USTw',
      'USD+',
      'DOLA',
      'aavUSDT',
      'aavUSDC',
      'EURC',
    ],
  },
  cronos: {
    name: 'Cronos',
    chainId: 25,
    rpc: ['https://evm.cronos.org'],
    explorerUrl: 'https://cronoscan.com',
    multicallAddress: '0x13aD51a6664973EbD0749a7c84939d973F247921',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xc8872773ADcC8264eEBe5E40D97943434264e973',
    providerName: 'Cronos',
    walletSettings: {
      chainId: `0x${parseInt('25', 10).toString(16)}`,
      chainName: 'Cronos',
      nativeCurrency: {
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18,
      },
      rpcUrls: ['https://evm.cronos.org/'],
      blockExplorerUrls: ['https://cronoscan.com/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      baseSafetyMargin: 0.1,
    },
    stableCoins: ['USDC', 'USDT', 'DAI', 'BUSD'],
  },
  moonbeam: {
    name: 'Moonbeam',
    chainId: 1284,
    rpc: ['https://rpc.api.moonbeam.network'],
    explorerUrl: 'https://moonscan.io',
    multicallAddress: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xA4afDf57663951C6204E5110EE1741e8dfb0F3ec',
    providerName: 'Moonbeam',
    walletSettings: {
      chainId: `0x${parseInt('1284', 10).toString(16)}`,
      chainName: 'Moonbeam',
      nativeCurrency: {
        name: 'GLMR',
        symbol: 'GLMR',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.api.moonbeam.network'],
      blockExplorerUrls: ['https://moonscan.io/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      baseSafetyMargin: 0.1,
    },
    stableCoins: [
      'USDC',
      'USDT',
      'DAI',
      'BUSD',
      'MAI',
      'FRAX',
      'USDTs',
      'USDCs',
      'DAIs',
      'stella4pool',
      'USDCwh',
      'USDTxc',
      'BUSDwh',
    ],
  },
  moonriver: {
    name: 'Moonriver',
    chainId: 1285,
    rpc: ['https://rpc.api.moonriver.moonbeam.network/'],
    explorerUrl: 'https://moonriver.moonscan.io',
    multicallAddress: '0x7f6fE34C51d5352A0CF375C0Fbe03bD19eCD8460',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xe8EeDE3a063AdF991096E317e916d9AF56cb11B2',
    providerName: 'Moonriver',
    walletSettings: {
      chainId: `0x${parseInt('1285', 10).toString(16)}`,
      chainName: 'Moonriver',
      nativeCurrency: {
        name: 'Moonriver',
        symbol: 'MOVR',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.api.moonriver.moonbeam.network/'],
      blockExplorerUrls: ['https://moonriver.moonscan.io/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      baseSafetyMargin: 0.1,
    },
    stableCoins: ['USDC', 'USDT', 'DAI', 'BUSD', 'MAI', 'MIM', 'FRAX', 'USDCm'],
  },
  metis: {
    name: 'Metis',
    chainId: 1088,
    rpc: ['https://andromeda.metis.io/?owner=1088'],
    explorerUrl: 'https://andromeda-explorer.metis.io',
    multicallAddress: '0x4fd2e1c2395dc088F36cab06DCe47F88A912fC85',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xDc34b7e0f1F1512f088D1854a54EAFfD4dCaC7Bd',
    providerName: 'Metis',
    walletSettings: {
      chainId: `0x${parseInt('1088', 10).toString(16)}`,
      chainName: 'Metis',
      nativeCurrency: {
        name: 'METIS',
        symbol: 'METIS',
        decimals: 18,
      },
      rpcUrls: ['https://andromeda.metis.io/?owner=1088'],
      blockExplorerUrls: ['https://andromeda-explorer.metis.io/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['mUSDT', 'mUSDC', 'mDAI', 'USDT', 'USDC'],
  },
  fuse: {
    name: 'Fuse',
    chainId: 122,
    rpc: ['https://rpc.fuse.io'],
    explorerUrl: 'https://explorer.fuse.io',
    multicallAddress: '0x4f22BD7CE44b0e0B2681A28e300A7285319de3a0',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x504A5F167BE8014b1d5CBDd993f3Bb34F95E70B2',
    providerName: 'Fuse',
    walletSettings: {
      chainId: `0x${parseInt('122', 10).toString(16)}`,
      chainName: 'Fuse',
      nativeCurrency: {
        name: 'FUSE',
        symbol: 'FUSE',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.fuse.io'],
      blockExplorerUrls: ['https://explorer.fuse.io/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['fUSD', 'BUSD', 'USDC', 'USDT'],
  },
  kava: {
    name: 'Kava',
    chainId: 2222,
    rpc: ['https://evm.kava.io'],
    explorerUrl: 'https://explorer.kava.io',
    multicallAddress: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x41D44B276904561Ac51855159516FD4cB2c90968',
    providerName: 'Kava',
    walletSettings: {
      chainId: `0x${parseInt('2222', 10).toString(16)}`,
      chainName: 'kava',
      nativeCurrency: {
        name: 'KAVA',
        symbol: 'KAVA',
        decimals: 18,
      },
      rpcUrls: ['https://evm.kava.io'],
      blockExplorerUrls: ['https://explorer.kava.io/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['USDC', 'DAI', 'USDT', 'axlDAI', 'axlUSDC', 'axlUSDT', 'MAI', 'USDt', 'MIM'],
  },
  canto: {
    name: 'Canto',
    chainId: 7700,
    rpc: ['https://mainnode.plexnode.org:8545'],
    explorerUrl: 'https://tuber.build',
    multicallAddress: '0xc34b9c9DBB39Be0Ef850170127A7b4283484f804',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x7c7B7FbccA5699175003ecbe1B41E79F40385469',
    providerName: 'Canto',
    walletSettings: {
      chainId: `0x${parseInt('7700', 10).toString(16)}`,
      chainName: 'canto',
      nativeCurrency: {
        name: 'CANTO',
        symbol: 'CANTO',
        decimals: 18,
      },
      rpcUrls: ['https://mainnode.plexnode.org:8545'],
      blockExplorerUrls: ['https://tuber.build/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['USDC', 'NOTE', 'USDT', 'BUSD'],
  },
  zksync: {
    name: 'zkSync',
    chainId: 324,
    rpc: ['https://mainnet.era.zksync.io'],
    explorerUrl: 'https://explorer.zksync.io',
    explorerTokenUrlTemplate: 'https://explorer.zksync.io/address/{address}',
    multicallAddress: '0x1E9231Cc9782D9F8e213736F6dAC00020D8271cB',
    multicall3Address: '0x9A04a9e1d67151AB1E742E6D8965e0602410f91d',
    appMulticallContractAddress: '0x5479d2A10e60110F4728d910b5321Af4B78c30E4',
    providerName: 'zkSync',
    walletSettings: {
      chainId: `0x${parseInt('324', 10).toString(16)}`,
      chainName: 'zksync',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.era.zksync.io'],
      blockExplorerUrls: ['https://explorer.zksync.io/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['USDC', 'BUSD', 'wTBT'],
  },
  zkevm: {
    name: 'Polygon zkEVM',
    chainId: 1101,
    rpc: ['https://zkevm-rpc.com'],
    explorerUrl: 'https://zkevm.polygonscan.com/',
    multicallAddress: '0xD19ab62F83380908D65E344567378cF104cE46c2',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x2ec5d5e9aaf3c3f56eBeF2fC46A5af9e42810b41',
    providerName: 'zkEVM',
    walletSettings: {
      chainId: `0x${parseInt('1101', 10).toString(16)}`,
      chainName: 'Polygon zkEVM',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://zkevm-rpc.com'],
      blockExplorerUrls: ['https://zkevm.polygonscan.com/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['USDC', 'USDT', 'DAI', 'FRAX'],
  },
  base: {
    name: 'Base',
    chainId: 8453,
    rpc: ['https://mainnet.base.org'],
    explorerUrl: 'https://basescan.org',
    multicallAddress: '0xbA790ec6F95D68123E772A43b314464585B311b4',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x354D3d7B61230C88F5f50176d9329d13366FbC28',
    providerName: 'Base',
    walletSettings: {
      chainId: `0x${parseInt('8453', 10).toString(16)}`,
      chainName: 'Base',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.ankr.com/base'],
      blockExplorerUrls: ['https://basescan.org/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.7,
      baseSafetyMargin: 0.2,
      priorityMinimum: '10000000', // 0.01 gwei
    },
    stableCoins: [
      'USDbC',
      'DAI',
      'bsUSD',
      'axlUSDC',
      'axlUSDT',
      'MIM',
      'USD+',
      'DAI+',
      'MAI',
      'DOLA',
      'USDC',
      'crvUSD',
      'eUSD',
      'hyUSD',
      'USDR',
      'wUSDR',
      'USDC+',
    ],
  },
  gnosis: {
    name: 'Gnosis',
    chainId: 100,
    rpc: ['https://gnosis.oat.farm'],
    explorerUrl: 'https://gnosisscan.io',
    multicallAddress: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x70Ed6174d8425332F7D9AD2d26C86902977307c0',
    providerName: 'Gnosis',
    walletSettings: {
      chainId: `0x${parseInt('100', 10).toString(16)}`,
      chainName: 'Gnosis',
      nativeCurrency: {
        name: 'XDAI',
        symbol: 'XDAI',
        decimals: 18,
      },
      rpcUrls: ['https://gnosis.oat.farm'],
      blockExplorerUrls: ['https://gnosisscan.io/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['xDAI', 'EURe', 'USDC', 'USDT', 'sDAI', 'crvUSD'],
  },
  linea: {
    name: 'Linea',
    chainId: 59144,
    rpc: ['https://linea.drpc.org'],
    explorerUrl: 'https://lineascan.build',
    multicallAddress: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xe536F8141D8EB7B1f096934AF3329cB581bFe995',
    providerName: 'Linea',
    walletSettings: {
      chainId: `0x${parseInt('59144', 10).toString(16)}`,
      chainName: 'Linea',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://linea.drpc.org'],
      blockExplorerUrls: ['https://lineascan.build'],
    },
    gas: {
      type: 'eip1559',
      blocks: 5,
      percentile: 0.2,
      baseMinimum: '7',
      baseSafetyMargin: 0.2,
    },
    stableCoins: ['USDT', 'USDC', 'DAI', 'MAI'],
  },
  mantle: {
    name: 'Mantle',
    chainId: 5000,
    rpc: ['https://rpc.mantle.xyz'],
    explorerUrl: 'https://explorer.mantle.xyz',
    multicallAddress: '0xAb35d11199216c7F7368080Cf41beD8f3AbBc4E4',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xBFE4FBaA07f413511abf3ED9Bcc8286b2F359FF3',
    providerName: 'Mantle',
    walletSettings: {
      chainId: `0x${parseInt('5000', 10).toString(16)}`,
      chainName: 'Mantle',
      nativeCurrency: {
        name: 'Mantle',
        symbol: 'MNT',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.mantle.xyz'],
      blockExplorerUrls: ['https://explorer.mantle.xyz'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['USDT', 'USDC', 'DAI'],
  },
  aurora: {
    name: 'Aurora',
    chainId: 1313161554,
    eol: 1691085875,
    rpc: ['https://mainnet.aurora.dev'],
    explorerUrl: 'https://aurorascan.dev',
    multicallAddress: '0x55f46144bC62e9Af4bAdB71842B62162e2194E90',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x88D537a86e09B753361D70448d60D3dC2D75883d',
    providerName: 'Aurora',
    walletSettings: {
      chainId: `0x${parseInt('1313161554', 10).toString(16)}`,
      chainName: 'Aurora Mainnet',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.aurora.dev'],
      blockExplorerUrls: ['https://aurorascan.dev/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['USDC', 'USDT', 'MAI', 'DAI', 'UST', 'aUSDO', 'USN'],
  },
  emerald: {
    name: 'Emerald',
    chainId: 42262,
    eol: 1691085875,
    rpc: ['https://emerald.oasis.dev'],
    explorerUrl: 'https://explorer.emerald.oasis.dev',
    multicallAddress: '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xd3C0A4AB6F68e3c12DEc753255b9f769E0bA615b',
    providerName: 'Oasis Emerald',
    walletSettings: {
      chainId: `0x${parseInt('42262', 10).toString(16)}`,
      chainName: 'Oasis Emerald',
      nativeCurrency: {
        name: 'Oasis Protocol',
        symbol: 'ROSE',
        decimals: 18,
      },
      rpcUrls: ['https://emerald.oasis.dev'],
      blockExplorerUrls: ['https://explorer.emerald.oasis.dev/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['ceUSDC', 'USDT'],
  },
  celo: {
    name: 'Celo',
    chainId: 42220,
    eol: 1691085875,
    rpc: ['https://forno.celo.org'],
    explorerUrl: 'https://celoscan.io',
    multicallAddress: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0x0bF5F48d8F761efAe0f187eCce60784e5d3E87E6',
    providerName: 'Celo',
    walletSettings: {
      chainId: `0x${parseInt('42220', 10).toString(16)}`,
      chainName: 'Celo',
      nativeCurrency: {
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18,
      },
      rpcUrls: ['https://forno.celo.org'],
      blockExplorerUrls: ['https://celoscan.io/'],
    },
    gas: {
      type: 'celo',
    },
    stableCoins: ['cUSD', 'cEUR', 'DAI', 'USDC', 'USDT'],
  },
  heco: {
    name: 'HECO',
    eol: 1681913494,
    chainId: 128,
    rpc: ['https://http-mainnet.hecochain.com'],
    explorerUrl: 'https://hecoinfo.com',
    multicallAddress: '0x2776CF9B6E2Fa7B33A37139C3CB1ee362Ff0356e',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xeCD68D935Fd331EbA27381929845737346577943',
    providerName: 'heco',
    walletSettings: {
      chainId: `0x${parseInt('128', 10).toString(16)}`,
      chainName: 'HECO Mainnet',
      nativeCurrency: {
        name: 'Huobi Token',
        symbol: 'HT',
        decimals: 18,
      },
      rpcUrls: ['https://http-mainnet.hecochain.com'],
      blockExplorerUrls: ['https://scan.hecochain.com/'],
    },
    gas: {
      type: 'eip1559',
      blocks: 100,
      percentile: 0.6,
      baseSafetyMargin: 0.1,
    },
    stableCoins: ['USDT', 'HUSD'],
  },
  harmony: {
    name: 'Harmony',
    eol: 1681913494,
    chainId: 1666600000,
    rpc: ['https://api.s0.t.hmny.io'],
    explorerUrl: 'https://explorer.harmony.one',
    multicallAddress: '0xBa5041B1c06e8c9cFb5dDB4b82BdC52E41EA5FC5',
    multicall3Address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    appMulticallContractAddress: '0xe8EeDE3a063AdF991096E317e916d9AF56cb11B2',
    providerName: 'harmony',
    walletSettings: {
      chainId: `0x${parseInt('1666600000', 10).toString(16)}`,
      chainName: 'Harmony One',
      nativeCurrency: {
        name: 'HARMONY',
        symbol: 'ONE',
        decimals: 18,
      },
      rpcUrls: ['https://api.s0.t.hmny.io/'],
      blockExplorerUrls: ['https://explorer.harmony.one/'],
    },
    gas: {
      type: 'standard',
    },
    stableCoins: ['BUSD', 'bscBUSD', 'USDC', 'USDT', 'UST', 'DAI', 'FRAX'],
  },
} satisfies Record<ChainConfig['id'], Omit<ChainConfig, 'id'>>;

export const chains: ChainEntity['id'][] = Object.keys(config) as ChainEntity['id'][];
