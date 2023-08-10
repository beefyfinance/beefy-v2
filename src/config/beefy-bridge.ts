import type { BeefyBridgeConfig } from '../features/data/apis/config-types';

export default {
  source: {
    id: 'mooBIFITest',
    symbol: 'mooBIFI',
    oracleId: 'mooFantomBIFI',
    address: '0x03360fe329F44c6B0bE4d8C89D2fd4c0151b226E',
    chainId: 'optimism',
    decimals: 18,
    description: 'Test mooBIFI description',
  },
  tokens: {
    optimism: '0x93883DA6605A0866ac1Bc79A2FC9b895D91e890E',
    arbitrum: '0x161A54739C7F4D601f3d6f7ed35A1387E9Eb857F',
  },
  bridges: {
    'layer-zero': {
      id: 'layer-zero',
      chains: {
        optimism: {
          chainId: '111',
          bridge: '0x0FA0F1D9d1533E4d74730aeAcf83e313d1966350',
        },
        arbitrum: {
          chainId: '110',
          bridge: '0x7B8bF990F0Af8917b1C774B49037AB04cce5A3C5',
        },
      },
    },
    'layer-zero-dummy': {
      id: 'layer-zero-dummy',
      chains: {
        optimism: {
          chainId: '111',
          bridge: '0x0FA0F1D9d1533E4d74730aeAcf83e313d1966350',
        },
        arbitrum: {
          chainId: '110',
          bridge: '0x7B8bF990F0Af8917b1C774B49037AB04cce5A3C5',
        },
      },
    },
  },
} as const satisfies BeefyBridgeConfig;
