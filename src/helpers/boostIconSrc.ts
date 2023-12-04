import { createGlobLoader } from './globLoader';

const pathToUrl = import.meta.glob<string>('../images/boosts/*.svg', {
  as: 'url',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getBoostIconSrc(name: string) {
  return keyToUrl([name]);
}
