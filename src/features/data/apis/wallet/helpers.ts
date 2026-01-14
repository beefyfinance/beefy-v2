import type { WalletOption } from './wallet-connection-types.ts';
import type { CreateWalletParams, Wallet, WalletParamsWithDefaults } from './wallet-types.ts';
import { createFactory } from '../../utils/factory-utils.ts';
import { SORT_PRIORITY_DEFAULT } from './constants.ts';

export function areRdnsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function isWalletOptionEqual(a: WalletOption, b: WalletOption): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.iconUrl === b.iconUrl &&
    a.type === b.type &&
    a.ui === b.ui &&
    areRdnsEqual(a.rdns, b.rdns)
  );
}

export function areWalletOptionsEqual(a: WalletOption[], b: WalletOption[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!isWalletOptionEqual(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

export function compareWalletOptionForSort(a: WalletOption, b: WalletOption): number {
  const priorityDiff = a.priority - b.priority;
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  return a.name.localeCompare(b.name);
}

export type Scalar = string | number | boolean | null | undefined | bigint;
export type LazyValue<T extends Scalar> = T | (() => T) | (() => Promise<T>);

type DefaultCreateWalletParams<
  provider = unknown,
  properties extends Record<string, unknown> = Record<string, unknown>,
  storageItem extends Record<string, unknown> = Record<string, unknown>,
> = {
  [K in WalletParamsWithDefaults]: CreateWalletParams<provider, properties, storageItem>[K];
};

export function createWallet<
  provider = unknown,
  properties extends Record<string, unknown> = Record<string, unknown>,
  storageItem extends Record<string, unknown> = Record<string, unknown>,
>(
  obj: CreateWalletParams<provider, properties, storageItem>
): Wallet<provider, properties, storageItem> {
  const { createConnector } = obj;
  // cached factory so only one connector instance is created per wallet
  const cachedCreateConnector = createFactory((...params: Parameters<typeof createConnector>) => {
    const connector = createConnector(...params);
    // force connector id to match wallet id
    Object.defineProperties(connector, {
      id: {
        configurable: false,
        enumerable: true,
        get() {
          // @dev getter, since could be a getter on wallet options object
          return obj.id;
        },
      },
    });
    return connector;
  });
  const defaults: DefaultCreateWalletParams<provider, properties, storageItem> = {
    hidden: false,
    ui: 'external' as const,
    priority: SORT_PRIORITY_DEFAULT,
    abortAction: 'none' as const,
    iconBackground: '#fff',
  };

  // Proxy (instead of ...spread) so that any getters on the original object still work
  // since some values are dynamic (e.g. browser wallet name/icon based on detected wallet)
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === 'createConnector') {
        return cachedCreateConnector;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop, receiver) ?? defaults[prop as keyof typeof defaults];
    },
  }) as Wallet<provider, properties, storageItem>;
}

export function normalizeRdns(
  rdns: string | string[] | readonly string[] | undefined
): readonly string[] {
  if (!rdns) {
    return [];
  }
  if (typeof rdns === 'string') {
    return [rdns];
  }
  return [...rdns];
}
