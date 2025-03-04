import type { PlatformEntity } from '../features/data/entities/platform.ts';
import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/platforms/*.(svg|png)', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getPlatformSrc(platformId: string) {
  return keyToUrl([platformId]);
}

export function platformAssetExists(platformId: PlatformEntity['id']): boolean {
  return getPlatformSrc(platformId) !== undefined;
}
