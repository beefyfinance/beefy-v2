import { createSearchPrompt } from '../../../utils/prompt';
import { getPlatforms, Platform } from '../../../lib/config/platform';

import { createFactory } from '../../../utils/factory';

export const createPlatformPrompt = createFactory(() =>
  createSearchPrompt<Platform, Platform['id']>(getPlatforms, platform => ({
    value: platform.id,
    name: platform.name,
  }))
);
