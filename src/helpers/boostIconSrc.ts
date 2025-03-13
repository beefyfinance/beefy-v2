import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/boosts/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getBoostIconSrc(name: string) {
  return keyToUrl([name]);
}
