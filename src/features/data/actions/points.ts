import { getPointsApi } from '../apis/points/points.ts';
import type { PointStructureEntity } from '../entities/points.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FulfilledInitPointsPayload = {
  structures: PointStructureEntity[];
};

export const initPoints = createAppAsyncThunk<FulfilledInitPointsPayload>(
  'points/init',
  async () => {
    const api = await getPointsApi();
    const structures = await api.fetchPoints();
    return { structures };
  }
);
