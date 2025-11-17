import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import { type SafeParameters } from '@wagmi/connectors';
import { createWallet } from '../helpers.ts';
import { isDefined } from '../../../utils/array-utils.ts';
import escapeStringRegexp from 'escape-string-regexp';

export type SafeWalletOptions = BaseWalletOptions &
  Omit<SafeParameters, 'appName' | 'appLogoUrl' | 'version'>;

// TODO automatically load this connect if we detect we're in a safe app iframe (might not need if eip6963 compliant)
export function safeAppWallet({ priority, ...safeOptions }: SafeWalletOptions = {}): WalletInit {
  return async function (_: WalletInitOptions) {
    const { safe } = await import('@wagmi/connectors');
    return createWallet({
      id: 'safe',
      name: 'Safe Wallet',
      iconUrl: () => import('../../../../../images/wallets/safe-wallet.svg').then(m => m.default),
      rdns: [],
      /** @dev hidden as this is just a way to connect in safe app iframe  */
      hidden: true,
      ui: 'external',
      priority,
      createConnector: safe({
        allowedDomains: getSafeDomainsRegexp(),
        ...safeOptions,
      }),
    });
  };
}

const defaultSafeDomainsRegexp = [/^app\.safe\.global$/i];

function getSafeDomainsRegexp(): RegExp[] {
  const env = import.meta.env.VITE_SAFE_DOMAINS;
  if (!env || typeof env !== 'string') {
    return defaultSafeDomainsRegexp;
  }
  const domains = env
    .split(',')
    .map(d => d.trim())
    .filter(isDefined);
  if (!domains.length) {
    return defaultSafeDomainsRegexp;
  }
  return domains.map(domain => RegExp(`^${escapeStringRegexp(domain)}$`, 'i'));
}
