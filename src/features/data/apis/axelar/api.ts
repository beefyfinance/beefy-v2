import { createDependencyFactory } from '../../utils/factory-utils.ts';

export const getAxelarApi = createDependencyFactory(
  async ({ AxelarApi }) => new AxelarApi(),
  () => import('./axelar-api.ts')
);
