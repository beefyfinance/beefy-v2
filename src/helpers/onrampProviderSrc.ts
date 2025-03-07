import { createGlobLoader } from './globLoader.ts';

const iconPathToUrl = import.meta.glob<string>('../images/onramp-providers/icons/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const logoPathToUrl = import.meta.glob<string>('../images/onramp-providers/logos/*.svg', {
  query: '?url',
  import: 'default',
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
