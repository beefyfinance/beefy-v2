import type { StargateConfig, StargateConfigPath, StargateConfigPool } from './types';
import type { ChainEntity } from '../../../../entities/chain';
import stargatePoolsJson from './stargate-pools.json';
import stargatePathsJson from './stargate-paths.json';

export const stargateConfigs: Partial<Record<ChainEntity['id'], StargateConfig>> = {
  ethereum: {
    chainId: 101,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  bsc: {
    chainId: 102,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  avax: {
    chainId: 106,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  polygon: {
    chainId: 109,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  arbitrum: {
    chainId: 110,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
    zapReceiverAddress: '0x9dFa8913E5eaFD4DE0bB29033c4249268C2ae331',
  },
  optimism: {
    chainId: 111,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
    zapReceiverAddress: '0x2B34705F5b5F37C6239dD8151d858A78f5959F2F',
  },
  fantom: {
    chainId: 112,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  metis: {
    chainId: 151,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  base: {
    chainId: 184,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  linea: {
    chainId: 183,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  kava: {
    chainId: 177,
    composerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
    depositGasLimit: '2000000',
  },
  mantle: {
    chainId: 181,
    composerAddress: '0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97',
    depositGasLimit: '2000000',
  },
};

export const stargatePools: Map<StargateConfigPool['id'], StargateConfigPool> = new Map(
  stargatePoolsJson.map(pool => [pool.id, pool as StargateConfigPool])
);
export const stargatePaths: StargateConfigPath[] = stargatePathsJson;
