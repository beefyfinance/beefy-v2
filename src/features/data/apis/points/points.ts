import { createDependencyFactory } from '../../utils/factory-utils.ts';

export const getPointsApi = createDependencyFactory(
  async ({ PointsApi }) => new PointsApi(),
  () => import('./PointsApi.ts')
);
