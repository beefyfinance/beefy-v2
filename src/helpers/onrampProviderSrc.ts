import { createGlobLoader } from './globLoader';

const iconPathToUrl = import.meta.glob('../images/onramp-providers/icons/*.svg', {
  as: 'url',
  eager: true,
});
const logoPathToUrl = import.meta.glob('../images/onramp-providers/icons/*.svg', {
  as: 'url',
  eager: true,
});

const iconKeyToUrl = createGlobLoader(iconPathToUrl);
const logoKeyToUrl = createGlobLoader(logoPathToUrl);

export function getOnRampProviderIcon(provider: string) {
  return iconKeyToUrl([provider]);
}

export function getOnRampProviderLogo(provider: string) {
  return logoKeyToUrl([provider]);
}
