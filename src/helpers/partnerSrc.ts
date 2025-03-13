import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/partners/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getPartnerSrc(mmId: string) {
  return keyToUrl([mmId]);
}
