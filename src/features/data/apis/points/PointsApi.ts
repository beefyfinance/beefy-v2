import type { PointStructureConfig } from './types.ts';

export class PointsApi {
  public async fetchPoints(): Promise<PointStructureConfig[]> {
    return (await import('../../../../config/points.json')).default as PointStructureConfig[];
  }
}
