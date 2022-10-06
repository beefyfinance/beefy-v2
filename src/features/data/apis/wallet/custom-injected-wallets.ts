import { InjectedNameSpace, InjectedWalletModule } from '@web3-onboard/injected-wallets/dist/types';

export const customInjectedWallets: InjectedWalletModule[] = [
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
    label: 'CDC Extension',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      // Injected from Browser Extension
      !!provider && !!provider['isDeficonnectProvider'],
    getIcon: async () => (await import(`../../../../images/wallets/crypto.png`)).default,
    getInterface: async () => ({ provider: (window as any).ethereum }),
    platforms: ['all'],
  },
  {
    label: 'CDC DeFi App',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      // Injected from App: DeFi app is fork of trust wallet
      !!provider && !!provider['isTrust'] && !('trust' in window),
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
];
