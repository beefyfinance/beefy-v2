import {
  InjectedNameSpace,
  InjectedWalletModule,
  ProviderIdentityFlag,
  ProviderLabel,
} from '@web3-onboard/injected-wallets/dist/types';
import { createEIP1193Provider } from '@web3-onboard/common';

export const customInjectedWallets: InjectedWalletModule[] = [
  {
    label: ProviderLabel.OKXWallet,
    injectedNamespace: InjectedNameSpace.OKXWallet,
    checkProviderIdentity: ({ provider }) =>
      !!provider && !!provider[ProviderIdentityFlag.OKXWallet],
    getIcon: async () =>
      (await import('@web3-onboard/injected-wallets/dist/icons/okxwallet.js')).default,
    getInterface: async () => ({
      provider: createEIP1193Provider((window as any).okxwallet),
    }),
    platforms: ['all'], // included in @web3-onboard/injected-wallets but only for desktop
  },
  {
    label: 'Core',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isAvalanche'],
    getIcon: async () => (await import(`../../../../images/wallets/core-wallet.svg`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
  {
    label: 'SafePal',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isSafePal'],
    getIcon: async () => (await import(`../../../../images/wallets/safepal-wallet.svg`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
  {
    label: 'CDC DeFi App',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      // Injected from App: DeFi app is fork of trust wallet
      !!provider &&
      !!provider['isTrust'] &&
      'deficonnect' in window &&
      !provider['isDeficonnectProvider'],
    getIcon: async () => (await import(`../../../../images/wallets/crypto.png`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
  {
    label: 'Math',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isMathWallet'],
    getIcon: async () => (await import(`../../../../images/wallets/math-wallet.svg`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
  {
    label: 'BitKeep',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isBitKeep'],
    getIcon: async () => (await import(`../../../../images/wallets/bitkeep-wallet.png`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
  {
    label: 'Trust Wallet',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      !!provider && !!provider['isTrust'] && !('deficonnect' in window),
    getIcon: async () => (await import(`../../../../images/wallets/trust-wallet.svg`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
];
