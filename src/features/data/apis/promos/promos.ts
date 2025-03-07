import { createDependencyFactory } from '../../utils/factory-utils.ts';

export const getPromosApi = createDependencyFactory(
  async ({ PromosApi }) => new PromosApi(),
  () => import('./PromosApi.ts')
);
