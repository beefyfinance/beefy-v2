import { createGlobLoader } from './globLoader';

const iconPathToUrl = import.meta.glob('../images/bridge-providers/icons/*.svg', {
  as: 'url',
  eager: true,
});
const logoPathToUrl = import.meta.glob('../images/bridge-providers/logos/*.svg', {
  as: 'url',
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
