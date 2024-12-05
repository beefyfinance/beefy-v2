import platforms from '../../../src/config/platforms.json';
import { createFactory } from '../../common/factory';
import type { PlatformType } from '../../../src/features/data/apis/config-types';
import i18keys from '../../../src/locales/en/main.json';
import { fileExists } from '../../common/files';
import { pconsole } from '../../common/pconsole';

const getPlatformIds = createFactory(() => {
  return new Set(platforms.map(platform => platform.id));
});

export function doesPlatformIdExist(platformId: string) {
  const lookup = getPlatformIds();
  return lookup.has(platformId);
}

export async function isPlatformConfigValid(): Promise<boolean> {
  let success = true;

  // @dev hack to make sure all the platform types in PlatformType are present in the set
  const validTypes = new Set<string>(
    Object.keys({
      amm: true,
      alm: true,
      bridge: true,
      'money-market': true,
      perps: true,
      'yield-boost': true,
      farm: true,
    } satisfies Record<PlatformType, unknown>)
  );

  // Check if valid types have i18n keys
  for (const type of validTypes.keys()) {
    const requiredKeys = [
      `Details-Platform-Type-Description-${type}`,
      `Details-Platform-Type-${type}`,
    ];
    for (const key of requiredKeys) {
      if (!i18keys[key]) {
        pconsole.error(`Missing i18n key "${key}" for platform type "${type}"`);
        success = false;
      }
    }
  }

  const platformsWithType = platforms.filter(
    (
      platform
    ): platform is Extract<
      (typeof platforms)[number],
      {
        type: string;
      }
    > => !!platform.type
  );
  await Promise.all(
    platformsWithType.map(async platform => {
      // Check type is valid
      if (!validTypes.has(platform.type)) {
        pconsole.error(`Platform ${platform.id}: Invalid type "${platform.type}"`);
        success = false;
      }

      // Platform image must exist if platform has a type
      const possiblePaths = [
        `./src/images/platforms/${platform.id}.svg`,
        `./src/images/platforms/${platform.id}.png`,
      ];
      let found = false;
      for (const path of possiblePaths) {
        if (await fileExists(path)) {
          found = true;
          break;
        }
      }
      if (!found) {
        pconsole.error(`Platform ${platform.id}: Missing image: "${possiblePaths[0]}"`);
        success = false;
      }
    })
  );

  return success;
}
