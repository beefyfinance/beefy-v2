import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/icons/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getIconSrc(name: string) {
  return keyToUrl([name]);
}
