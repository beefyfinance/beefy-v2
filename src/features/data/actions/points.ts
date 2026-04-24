import { getPointsApi } from '../apis/points/points.ts';
import type { PointStructureEntity } from '../entities/points.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FulfilledInitPointsPayload = {
  structures: PointStructureEntity[];
};

export const initPoints = createAppAsyncThunk<FulfilledInitPointsPayload>(
  'points/init',
  async () => {
    try {
      const api = await getPointsApi();
      const structures = await api.fetchPoints();
      return { structures } satisfies FulfilledInitPointsPayload;
    } catch (err) {
      console.error('initPoints: failed to load points config, continuing with no structures', err);
      return { structures: [] } satisfies FulfilledInitPointsPayload;
    }
  }
);
