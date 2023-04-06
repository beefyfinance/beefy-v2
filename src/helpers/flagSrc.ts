import { createGlobLoader } from './globLoader';

const pathToUrl = import.meta.glob('../images/currency-flags/*.png', {
  as: 'url',
  eager: true,
});

const keyToUrl = createGlobLoader(pathToUrl);

export function getCurrencyFlag(currencyCode: string) {
  return keyToUrl([currencyCode]);
}
