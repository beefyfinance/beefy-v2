import { PlatformRiskId } from './risk';
import { ExtractStartsRest } from '../../utils/types';
import { createFactory } from '../../utils/factory';

export type PlatformRisk = ExtractStartsRest<PlatformRiskId, 'PLATFORM_'>;

export type Platform = {
  id: string;
  name: string;
  filter: boolean;
  risks: PlatformRisk[];
};

export const getPlatforms = createFactory(async (): Promise<Platform[]> => {
  const module = await import('../../../../src/config/platforms.json');
  return module.default.map(platform => ({
    ...platform,
    filter: !!platform.filter,
    risks: (platform.risks || []) as PlatformRisk[],
  }));
});
