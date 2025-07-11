import type { InjectedWalletModule } from '@web3-onboard/injected-wallets/dist/types';
import {
  InjectedNameSpace,
  ProviderIdentityFlag,
  ProviderLabel,
} from '@web3-onboard/injected-wallets/dist/types';
import { createEIP1193Provider } from '@web3-onboard/common';
import type { EIP1193Provider } from '@web3-onboard/core';
import { createThirdwebClient, defineChain } from 'thirdweb';
import { mainnet, polygon } from 'thirdweb/chains';
import { autoConnect, EIP1193, type Wallet } from 'thirdweb/wallets';
import { unicornThirdwebClient } from './wallet-connection';

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
  // I was not sure if I had to add Unicorn's logic here as well
  {
    label: 'Unicorn', // This label is used in `tryToAutoReconnect`
    // You must add a `unicorn.svg` to the `src/images/wallets/` directory
    getIcon: async () => (await import('../../../../images/wallets/crypto.png')).default,
    getInterface: async () => {
      const getAutoConnectWallet = async (): Promise<Wallet | null> => {
        try {

          let returningWallet = null;
          await autoConnect({
            client: unicornThirdwebClient,
            accountAbstraction: {
              chain: defineChain(mainnet.id),
              sponsorGas: true,
              factoryAddress: '0xD771615c873ba5a2149D5312448cE01D677Ee48A',
            },
            onConnect: (wallet) => {
              console.log('Unicorn.eth wallet auto-connected:', wallet.getAccount());
              returningWallet = wallet
              return wallet
            },
          });

          return returningWallet

        } catch (error) {
          // If autoConnect fails for any reason (e.g., no wallet to connect to, user rejection),
          // it will throw an error, which we catch here.
          console.error("Auto-connect failed:", error);
          return null; // Return null to indicate failure.
        }
      };
      try {

        const wallet = await getAutoConnectWallet()

        console.log("This is the wallet returned from getAutoConnectWallet", wallet)

        if (wallet === null) throw new Error("Auto connect wallet not available")


        console.log("Reached here with this wallet", wallet)
        // Convert the thirdweb wallet to a standard EIP-1193 provider for web3-onboard
        const provider = EIP1193.toProvider({
          wallet: wallet,
          chain: polygon,
          client: unicornThirdwebClient,
        });

        return { provider };
      } catch (error) {
        // We throw an error to signal to web3-onboard that this wallet is not available.
        console.debug('Unicorn.eth auto-connect not available.', error);
        throw new Error('Unicorn wallet not available.');
      }
    },
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) => !!provider && !!provider['isBinance'],
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
