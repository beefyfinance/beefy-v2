import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import { safe, type SafeParameters } from '@wagmi/connectors';
import { createWallet } from '../helpers.ts';
import { isDefined } from '../../../utils/array-utils.ts';
import escapeStringRegexp from 'escape-string-regexp';

export type SafeWalletOptions = BaseWalletOptions &
  Omit<SafeParameters, 'appName' | 'appLogoUrl' | 'version'>;

/** @see VITE_SAFE_DOMAINS env */
const defaultSafeDomainsRegexp = [/^app\.safe\.global$/i];

type SafeMessage<T> = {
  id: string;
  version: string;
} & ({ success: true; data: T } | { success: false });

function isSafeMessage<T = unknown>(message: unknown): message is SafeMessage<T> {
  return (
    !!message &&
    typeof message === 'object' &&
    'id' in message &&
    'version' in message &&
    'success' in message &&
    typeof message.id === 'string' &&
    typeof message.version === 'string' &&
    typeof message.success === 'boolean'
  );
}

export function safeAppWallet({ priority, ...safeOptions }: SafeWalletOptions = {}): WalletInit {
  return function (_: WalletInitOptions) {
    const allowedDomains = getSafeDomainsRegexp();
    let isSafeApp = false;

    detectSafeApp(allowedDomains, detected => {
      isSafeApp = detected;
    });

    return createWallet({
      id: 'safe',
      name: 'Safe Wallet',
      iconUrl: () => import('../../../../../images/wallets/safe-wallet.svg').then(m => m.default),
      rdns: ['global.safe.app'],
      get hidden() {
        return !isSafeApp;
      },
      ui: 'external',
      get priority() {
        return isSafeApp ? 0 : priority;
      },
      createConnector: safe({
        allowedDomains: getSafeDomainsRegexp(),
        ...safeOptions,
      }),
    });
  };
}

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

function isAllowedOrigin(origin: string, allowedDomains: RegExp[]): boolean {
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'https:') {
      return false;
    }
    return allowedDomains.some(regex => regex.test(hostname));
  } catch {
    return false;
  }
}

function detectSafeApp(allowedDomains: RegExp[], callback: (isSafeApp: boolean) => void) {
  if (!window || !window.parent || window.parent === window) {
    callback(false);
    return;
  }

  const messageIds = new Set<string>();
  const maxTries = 5;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let tries = 0;
  let backOff = 500;

  const sendSafeMessage = () => {
    try {
      const id = Math.trunc(Math.random() * 3656158440062976).toString(36);
      messageIds.add(id);
      window.parent.postMessage({
        id,
        method: 'getSafeInfo',
        env: {
          sdkVersion: '9.1.0',
        },
      });
      return true;
    } catch {
      return false;
    }
  };

  const onMessage = (event: MessageEvent) => {
    if (
      event.origin &&
      isAllowedOrigin(event.origin, allowedDomains) &&
      isSafeMessage(event.data) &&
      messageIds.has(event.data.id)
    ) {
      resolve(true);
    }
  };

  const resolve = (isSafeApp: boolean) => {
    clearTimeout(timeoutId);
    window.removeEventListener('message', onMessage);
    messageIds.clear();
    callback(isSafeApp);
  };

  const trySendSafeMessage = () => {
    if (!sendSafeMessage()) {
      resolve(false);
      return;
    }

    tries += 1;
    if (tries > maxTries) {
      resolve(false);
      return;
    }

    backOff *= 2;
    timeoutId = setTimeout(trySendSafeMessage, backOff);
  };

  window.addEventListener('message', onMessage);
  trySendSafeMessage();
}
