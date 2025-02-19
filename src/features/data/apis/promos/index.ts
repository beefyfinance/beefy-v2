import { createDependencyFactory } from '../../utils/factory-utils';

export const getPromosApi = createDependencyFactory(
  async ({ PromosApi }) => new PromosApi(),
  () => import('./PromosApi')
);
