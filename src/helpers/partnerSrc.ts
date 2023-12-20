import { createGlobLoader } from './globLoader';

const pathToUrl = import.meta.glob<string>('../images/partners/*.svg', {
  as: 'url',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getPartnerSrc(mmId: string) {
  return keyToUrl([mmId]);
}
