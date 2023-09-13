import type { BeefyBridgeConfig } from '../features/data/apis/config-types';
import BigNumber from 'bignumber.js';

export default {
  source: {
    id: 'mooTest',
    symbol: 'mooTest',
    oracleId: 'mooFantomBIFI',
    address: '0x3960f6c882d11B797bd3f574D77E339516813B5A',
    chainId: 'ethereum',
    decimals: 18,
    description: 'Test BIFI description',
  },
  tokens: {
    ethereum: '0x3B2faF664d6cCA5248CD7f44a6538A1fFdCcF7F0',
    optimism: '0x665E21ce21B1e7c7401647c1fb740981b270b71d',
    arbitrum: '0x508c6cF93e7D6793d7dB8b8B01ac6752A4275d75',
  },
  bridges: [
    {
      id: 'axelar',
      explorerUrl: 'https://axelarscan.io/gmp/{{hash}}',
      chains: {
        ethereum: {
          bridge: '0xaaa751957312589Cd21B2348f6B05b8b40691eF3',
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
          bridge: '0xaaa751957312589Cd21B2348f6B05b8b40691eF3',
          time: {
            outgoing: 30,
            incoming: 2,
          },
          gasLimits: {
            outgoing: new BigNumber('150000'), // ~140,163 before refunds
            incoming: new BigNumber('170000'), // ~166,545 before refunds
          },
        },
        arbitrum: {
          bridge: '0xaaa751957312589Cd21B2348f6B05b8b40691eF3',
          time: {
            outgoing: 20,
            incoming: 2,
          },
          gasLimits: {
            outgoing: new BigNumber('150000'), // ~142,205 before refunds
            incoming: new BigNumber('170000'), // ~166,545 before refunds
          },
        },
      },
    },
    {
      id: 'chainlink',
      explorerUrl: 'https://ccip.chain.link/tx/{{hash}}',
      chains: {
        ethereum: {
          bridge: '0xccccB27BB46ffE01479248EDDFb75E300DE06879',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
        optimism: {
          bridge: '0xccccB27BB46ffE01479248EDDFb75E300DE06879',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
      },
    },
    {
      id: 'layer-zero',
      explorerUrl: 'https://layerzeroscan.com/tx/{{hash}}',
      chains: {
        ethereum: {
          bridge: '0xdddEedaBa09b08d052FaA67aCeCF36457252314f',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
        optimism: {
          bridge: '0xdddEedaBa09b08d052FaA67aCeCF36457252314f',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
        arbitrum: {
          bridge: '0xdddEedaBa09b08d052FaA67aCeCF36457252314f',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
      },
    },
    {
      id: 'optimism',
      chains: {
        ethereum: {
          bridge: '0xbbb6A6474729AEB3b2c83c4acCFf96711ff88589',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            approve: new BigNumber('70000'),
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
        optimism: {
          bridge: '0xbbb6A6474729AEB3b2c83c4acCFf96711ff88589',
          time: {
            outgoing: 0,
            incoming: 0,
          },
          gasLimits: {
            outgoing: new BigNumber('1'),
            incoming: new BigNumber('1'),
          },
        },
      },
    },
  ],
} as const satisfies BeefyBridgeConfig;
