import type { ChainEntity } from '../features/data/entities/chain';

const QiDao = [
  'fantom-bifi-maxi',
  'scream-eth',
  'scream-wbtc',
  'scream-ftm',
  'scream-link',
  'scream-dai',
  'aave-wavax',
  'aavev3-op-wbtc',
  'aavev3-op-dai',
  'aavev3-op-eth',
  'curve-op-f-wsteth',
];

const Nexus: ChainEntity['id'][] = ['ethereum'];
const OpenCover: ChainEntity['id'][] = [
  'polygon',
  'bsc',
  'optimism',
  'fantom',
  'arbitrum',
  'avax',
  'cronos',
  'moonbeam',
  'moonriver',
  'metis',
  'fuse',
  'kava',
  'canto',
  'zksync',
  'zkevm',
  'base',
  'gnosis',
  'linea',
  'mantle',
];

export { QiDao, OpenCover, Nexus };
