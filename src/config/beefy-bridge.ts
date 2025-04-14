import type { BeefyBridgeConfig } from '../features/data/apis/config-types.ts';
import BigNumber from 'bignumber.js';

export const beefyBridgeConfig = {
  source: {
    id: 'mooBIFI',
    symbol: 'mooBIFI',
    oracleId: 'mooBIFI',
    address: '0xBEEF8e0982874e0292E6C5751C5A4092b3e1BEEF',
    chainId: 'ethereum',
    decimals: 18,
  },
  tokens: {
    ethereum: '0xb1feA302f3B2E93FA04E46dCCE35F2Fc522d7bB9',
    optimism: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    base: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    sonic: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
  },
  bridges: [
    {
      id: 'axelar',
      title: 'Axelar',
      explorerUrl: 'https://axelarscan.io/gmp/{{hash}}',
      chains: {
        ethereum: {
          bridge: '0xaaa6A279fC98b9bF94bD479C90D701417e361fc2',
          time: {
            outgoing: 20,
            incoming: 2,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('250000'), // ~240,814 before refunds
            incoming: new BigNumber('170000'), // ~166,545 before refunds
          },
        },
        optimism: {
          bridge: '0xaaa6A279fC98b9bF94bD479C90D701417e361fc2',
          time: {
            outgoing: 30,
            incoming: 2,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('150000'), // ~140,163 before refunds
            incoming: new BigNumber('170000'), // ~166,545 before refunds
          },
        },
        base: {
          bridge: '0xaaa6A279fC98b9bF94bD479C90D701417e361fc2',
          time: {
            outgoing: 30,
            incoming: 2,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('150000'), // ~140,163 before refunds
            incoming: new BigNumber('170000'), // ~166,545 before refunds
          },
        },
      },
    } /*
            {
              id: 'chainlink',
              title: 'Chainlink',
              explorerUrl: 'https://ccip.chain.link/tx/{{hash}}',
              chains: {
                ethereum: {
                  bridge: '0xcccEa7Fe84272995664369334351Fe344E2732aE',
                  time: {
                    outgoing: 18,
                    incoming: 5,
                  },
                  gasLimits: {
                    approve: new BigNumber('70000'),
                    outgoing: new BigNumber('320000'), // ~314,686 before refunds
                    incoming: new BigNumber('310000 '), // ~300,027 before refunds
                  },
                },
                optimism: {
                  bridge: '0xcccEa7Fe84272995664369334351Fe344E2732aE',
                  time: {
                    outgoing: 18,
                    incoming: 3,
                  },
                  gasLimits: {
                    approve: new BigNumber('70000'),
                    outgoing: new BigNumber('230000'), // ~216,481 before refunds
                    incoming: new BigNumber('220000'), // ~211,298 before refunds
                  },
                },
              },
            },*/,
    {
      id: 'layer-zero',
      title: 'LayerZero',
      explorerUrl: 'https://layerzeroscan.com/tx/{{hash}}',
      chains: {
        ethereum: {
          bridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
          time: {
            outgoing: 1,
            incoming: 4,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('350000'), // ~347,270 before refunds
            incoming: new BigNumber('1'),
          },
        },
        optimism: {
          bridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
          time: {
            outgoing: 1,
            incoming: 4,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('280000'), // ~279,132 before refunds
            incoming: new BigNumber('270000'), // ~261,283 before refunds
          },
        },
        base: {
          bridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
          time: {
            outgoing: 1,
            incoming: 4,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('280000'), // ~279,132 before refunds
            incoming: new BigNumber('270000'), // ~261,283 before refunds
          },
        },
        sonic: {
          bridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
          time: {
            outgoing: 1,
            incoming: 4,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('310000'), // ~301,943 before refunds
            incoming: new BigNumber('330000'), // ~325,620 before refunds
          },
        },
      },
    },
    {
      id: 'optimism',
      title: 'Optimism',
      chains: {
        ethereum: {
          bridge: '0xbbb8971aEA2627fa2E1342bb5Bf952Ec521479f2',
          receiveDisabled: true,
          time: {
            outgoing: 2,
            incoming: 0,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('300000'), // ~296,305 before refunds
            incoming: new BigNumber('140000'), // unknown TODO
          },
        },
        optimism: {
          bridge: '0xbbb8971aEA2627fa2E1342bb5Bf952Ec521479f2',
          sendDisabled: true,
          time: {
            outgoing: 10080,
            incoming: 0,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('140000'), // ~130,947 before refunds
            incoming: new BigNumber('140000'), // ~134,500 before refunds
          },
        },
      },
    },
  ],
} as const satisfies BeefyBridgeConfig;
