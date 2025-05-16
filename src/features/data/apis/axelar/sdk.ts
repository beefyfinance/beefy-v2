import { createDependencyFactoryWithCacheByChain } from '../../utils/factory-utils.ts';

export const getAxelarSdk = createDependencyFactoryWithCacheByChain(
  async (destinationChain, { AxelarSDK }) => new AxelarSDK(destinationChain),
  () => import('./axelar-sdk.ts')
);
