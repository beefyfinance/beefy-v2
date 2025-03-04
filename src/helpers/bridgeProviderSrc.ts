import { createGlobLoader } from './globLoader.ts';

const iconPathToUrl = import.meta.glob<string>('../images/bridge-providers/icons/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const logoPathToUrl = import.meta.glob<string>('../images/bridge-providers/logos/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});

const iconKeyToUrl = createGlobLoader(iconPathToUrl);
const logoKeyToUrl = createGlobLoader(logoPathToUrl);

export function getBridgeProviderIcon(provider: string) {
  return iconKeyToUrl(provider);
}

export function getBridgeProviderLogo(provider: string) {
  return logoKeyToUrl(provider);
}
