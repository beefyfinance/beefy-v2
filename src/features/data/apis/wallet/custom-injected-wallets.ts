import type { InjectedWalletModule } from '@web3-onboard/injected-wallets/dist/types';
import {
  InjectedNameSpace,
  ProviderIdentityFlag,
  ProviderLabel,
} from '@web3-onboard/injected-wallets/dist/types';
import { createEIP1193Provider } from '@web3-onboard/common';
import type { EIP1193Provider } from '@web3-onboard/core';

declare const window: {
  ethereum?: EIP1193Provider;
  okxwallet?: unknown;
  deficonnect?: unknown;
  deficonnectProvider?: unknown;
} & Window;

export const customInjectedWallets: InjectedWalletModule[] = [
  {
    // included in @web3-onboard/injected-wallets but only for desktop
    label: ProviderLabel.OKXWallet,
    injectedNamespace: InjectedNameSpace.OKXWallet,
    checkProviderIdentity: ({ provider }) =>
      !!provider && !!provider[ProviderIdentityFlag.OKXWallet],
    getIcon: async () =>
      (await import('@web3-onboard/injected-wallets/dist/icons/okxwallet.js')).default,
    getInterface: async () =>
      Promise.resolve({
        provider: createEIP1193Provider(window['okxwallet']),
      }),
    platforms: ['all'],
  },
  {
    label: 'Binance',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isBinance'],
    getIcon: async () => (await import('../../../../images/wallets/binance-wallet.svg')).default,
    getInterface: async () => Promise.resolve({ provider: window['ethereum'] }),
    platforms: ['all'],
  },
  {
    // included in @web3-onboard/injected-wallets but only for desktop
    label: 'Core',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isAvalanche'],
    getIcon: async () => (await import('../../../../images/wallets/core-wallet.svg')).default,
    getInterface: async () => Promise.resolve({ provider: window['ethereum'] }),
    platforms: ['all'],
  },
  {
    // Injected from App: DeFi app is fork of trust wallet (or at least sets isTrust)
    label: 'CDC DeFi App',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      !!provider &&
      !!provider['isTrust'] &&
      'deficonnect' in window &&
      !provider['isDeficonnectProvider'],
    getIcon: async () => (await import('../../../../images/wallets/crypto.png')).default,
    getInterface: async () => Promise.resolve({ provider: window['ethereum'] }),
    platforms: ['all'],
  },
  {
    label: 'BitKeep',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isBitKeep'],
    getIcon: async () => (await import('../../../../images/wallets/bitkeep-wallet.png')).default,
    getInterface: async () => Promise.resolve({ provider: window['ethereum'] }),
    platforms: ['all'],
  },
  {
    // included in @web3-onboard/injected-wallets but has false positive if CDC DeFi App
    label: 'Trust Wallet',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      !!provider && !!provider['isTrust'] && !('deficonnect' in window),
    getIcon: async () => (await import('../../../../images/wallets/trust-wallet.svg')).default,
    getInterface: async () => Promise.resolve({ provider: window['ethereum'] }),
    platforms: ['all'],
  },
];
