import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import type { InjectedParameters } from '@wagmi/core';
import defaultIcon from '../../../../../images/wallets/browser-wallet.svg';
import { createWallet, type LazyValue, normalizeRdns } from '../helpers.ts';
import { SORT_PRIORITY_BROWSER } from '../constants.ts';
import { injected } from '@wagmi/connectors';

type WagmiTarget = Exclude<InjectedParameters['target'], undefined | string | (() => unknown)>;
type WagmiProviderFn = Extract<WagmiTarget['provider'], () => unknown>;
type WagmiWindow = Exclude<Parameters<WagmiProviderFn>[0], undefined>;
type WagmiProvider = Exclude<WagmiWindow['ethereum'], undefined>;

type BrowserWalletProvider = WagmiProvider;
type BrowserWalletWindow = WagmiWindow & {
  okxwallet?: WagmiProvider;
};

type Flag = `is${string}`;
type FlagState<TFlag extends Flag> = {
  [K in TFlag]: boolean;
};
type FlagMatcher<TFlag extends Flag> = (state: FlagState<TFlag>, flags: TFlag[]) => boolean;

export type BrowserWalletIdentifierOption<TFlag extends Flag> = {
  id: string;
  name: string;
  rdns?: string | string[] | undefined;
  iconUrl: LazyValue<string>;
  flags?: TFlag | TFlag[];
  matcher?: FlagMatcher<TFlag>;
};

export type BrowserWalletOptions<
  TFlag extends Flag,
  TIdentifier extends BrowserWalletIdentifierOption<TFlag>,
> = BaseWalletOptions & {
  injectedAt?: keyof BrowserWalletWindow;
  identifiers: TIdentifier[];
};

type BrowserWalletIdentifier<TFlag extends Flag = Flag> = {
  id: string;
  name: string;
  rdns: readonly string[];
  iconUrl: LazyValue<string>;
  flags: TFlag[];
  matcher: FlagMatcher<TFlag>;
};

function defaultFlagMatcher<TFlag extends Flag>(state: FlagState<TFlag>, flags: TFlag[]) {
  return flags.length === 0 || flags.every(flag => state[flag]);
}

function isProvider(provider: unknown): provider is WagmiProvider {
  return (
    !!provider &&
    typeof provider === 'object' &&
    'request' in provider &&
    typeof provider.request === 'function'
  );
}

type ProviderWithFlag<
  TProvider extends WagmiProvider,
  TFlag extends string,
  TType = boolean,
> = TProvider & { [K in TFlag]: TType };

function hasProviderFlag<TProvider extends WagmiProvider, TFlag extends string>(
  provider: TProvider,
  flag: TFlag
): provider is ProviderWithFlag<TProvider, TFlag> {
  if (!(flag in provider)) {
    return false;
  }
  const maybeProvider = provider as ProviderWithFlag<TProvider, TFlag, unknown>;
  return maybeProvider[flag] === true;
}

function isMatchingProvider<T extends Flag>(
  provider: unknown,
  flags: T[],
  matcher: FlagMatcher<T>
): boolean {
  if (!isProvider(provider)) {
    return false;
  }

  if (flags.length === 0) {
    return true;
  }

  const state = flags.reduce(
    (acc, flag) => {
      acc[flag] = hasProviderFlag(provider, flag);
      return acc;
    },
    {} as Record<T, boolean>
  );

  return matcher(state, flags);
}

export function browserWallet<
  const TFlag extends Flag,
  const TIdentifier extends BrowserWalletIdentifierOption<TFlag>,
>({
  priority = SORT_PRIORITY_BROWSER,
  injectedAt = 'ethereum',
  identifiers: identifierOptions,
}: BrowserWalletOptions<TFlag, TIdentifier>): WalletInit {
  return function (_: WalletInitOptions) {
    const fallbackIdentifier: BrowserWalletIdentifier = {
      id: `browserWallet.${injectedAt}`,
      name: 'Browser Wallet',
      iconUrl: defaultIcon,
      rdns: [],
      flags: [],
      matcher: defaultFlagMatcher,
    };
    const identifiers: BrowserWalletIdentifier[] = identifierOptions.map(option => ({
      ...option,
      flags: (option.flags ?
        Array.isArray(option.flags) ?
          option.flags
        : [option.flags]
      : []) as Flag[],
      matcher: (option.matcher || defaultFlagMatcher) as FlagMatcher<Flag>,
      rdns: normalizeRdns(option.rdns),
    }));
    let identifier = fallbackIdentifier;
    let lastInjectedProvider: BrowserWalletProvider | undefined;

    const getIdentifier = (
      browserWindow: BrowserWalletWindow | undefined = window as BrowserWalletWindow | undefined
    ) => {
      const injectedProvider = browserWindow?.[injectedAt] || undefined;
      if (lastInjectedProvider === injectedProvider) {
        return identifier;
      }

      if (!isProvider(injectedProvider)) {
        identifier = fallbackIdentifier;
        lastInjectedProvider = undefined;
        return identifier;
      }

      lastInjectedProvider = injectedProvider;
      identifier =
        identifiers.find(wallet =>
          isMatchingProvider(injectedProvider, wallet.flags, wallet.matcher)
        ) ?? fallbackIdentifier;
      console.log(injectedProvider, identifier);
      return identifier;
    };

    return createWallet({
      get id() {
        return fallbackIdentifier.id;
      },

      get name() {
        return getIdentifier().name;
      },

      get iconUrl() {
        return getIdentifier().iconUrl;
      },

      get rdns() {
        return getIdentifier().rdns;
      },

      get hidden() {
        const maybeProvider =
          (window as BrowserWalletWindow | undefined)?.[injectedAt] || undefined;
        return !maybeProvider || !isProvider(maybeProvider);
      },

      priority,

      createConnector: injected({
        shimDisconnect: true,
        target: {
          id: fallbackIdentifier.id,
          name: fallbackIdentifier.name,
          provider(browserWindow?: BrowserWalletWindow) {
            const maybeProvider = browserWindow?.[injectedAt] || undefined;
            return isProvider(maybeProvider) ? maybeProvider : undefined;
          },
        },
      }),
    });
  };
}
