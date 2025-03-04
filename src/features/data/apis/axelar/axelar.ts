import {
  createDependencyFactory,
  createDependencyFactoryWithCacheByChain,
} from '../../utils/factory-utils.ts';

export const getAxelarApi = createDependencyFactory(
  async ({ AxelarApi }) => new AxelarApi(),
  () => import('./axelar-api.ts')
);

export const getAxelarSdk = createDependencyFactoryWithCacheByChain(
  async (destinationChain, { AxelarSDK }) => new AxelarSDK(destinationChain),
  () => import('./axelar-sdk.ts')
);
