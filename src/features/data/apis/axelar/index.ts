import {
  createDependencyFactory,
  createDependencyFactoryWithCacheByChain,
} from '../../utils/factory-utils';

export const getAxelarApi = createDependencyFactory(
  async ({ AxelarApi }) => new AxelarApi(),
  () => import('./axelar-api')
);

export const getAxelarSdk = createDependencyFactoryWithCacheByChain(
  async (destinationChain, { AxelarSDK }) => new AxelarSDK(destinationChain),
  () => import('./axelar-sdk')
);
