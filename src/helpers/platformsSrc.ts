import type { PlatformEntity } from '../features/data/entities/platform';
import { createGlobLoader } from './globLoader';

const pathToUrl = import.meta.glob('../images/platforms/*.(svg|webp|png)', {
  as: 'url',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getPlatformSrc(platformId: string) {
  return keyToUrl([platformId]);
}

export function platformAssetExists(platformId: PlatformEntity['id']): boolean {
  return getPlatformSrc(platformId) !== undefined;
}
