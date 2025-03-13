import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/transact-providers/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});

const keyToUrl = createGlobLoader(pathToUrl);

export function getTransactProviderIcon(provider: string) {
  return keyToUrl([provider]);
}
