import { ProviderPoolConfig } from './types';

export default {
  strategyTypeId: 'pool',
  feeTier: 'Dynamic',
} as const satisfies ProviderPoolConfig;
