import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/currency-flags/*.png', {
  query: '?url',
  import: 'default',
  eager: true,
});

const keyToUrl = createGlobLoader(pathToUrl);

export function getCurrencyFlag(currencyCode: string) {
  return keyToUrl([currencyCode]);
}
