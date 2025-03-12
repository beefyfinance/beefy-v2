import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/platforms/*.(svg|webp|png)', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getPlatformSrc(platformId: string) {
  return keyToUrl([platformId]);
}
