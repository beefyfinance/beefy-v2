import { createGlobLoader } from './globLoader';

const pathToUrl = import.meta.glob('../images/transact-providers/*.svg', {
  as: 'url',
  eager: true,
});

const keyToUrl = createGlobLoader(pathToUrl);

export function getTransactProviderIcon(provider: string) {
  return keyToUrl([provider]);
}
