import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/curators/*.(svg|webp|png)', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getCuratorSrc(curatorId: string) {
  return keyToUrl([curatorId]);
}
