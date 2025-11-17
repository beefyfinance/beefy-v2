import type { WalletInit, WalletInitOptions } from './wallet-types.ts';
import beefyIcon from '../../../../images/miniapp/icon.png?url';
import { browserWallet } from './wallets/browserWallet.ts';
import { walletConnectWallet } from './wallets/walletConnectWallet.ts';
import { fireblocksWallet } from './wallets/fireblocksWallet.ts';
import { baseAccountWallet } from './wallets/baseAccountWallet.ts';
import { coinbaseWallet } from './wallets/coinbaseWallet.ts';
import { metaMaskWallet } from './wallets/metamaskWallet.ts';
import { SORT_PRIORITY_DEFAULT } from './constants.ts';

type CreateWalletsConfigParameters = WalletInitOptions & {
  /** auto connect options
   * injected - array of rdns to attempt auto-connection to
   **/
  autoConnect?: {
    /** rdns */
    injected?: string[];
  };
  /**
   * initial wallets to load
   * wagmi connectors will be created on page load
   * @dev put low resource wallets here only (e.g. browserWallet)
   **/
  initial: WalletInit[];
  /**
   * additional wallets to load
   * wagmi connectors will be created when user clicks wallet in modal
   *  or when attempting to reconnect to a previously used wallet
   * @dev put high resource wallets here (e.g. metamask, walletConnect, coinbase, etc)
   **/
  lazy: WalletInit[];
};

export type WalletsConfig = CreateWalletsConfigParameters;

function createWalletsConfig(input: CreateWalletsConfigParameters): WalletsConfig {
  return input;
}

export const walletsConfig = createWalletsConfig({
  app: {
    name: 'Beefy',
    description: 'Earn the highest APYs on your crypto with safety and efficiency in mind',
    url: window?.location.origin || 'https://app.beefy.com',
    icon: `${window?.location.origin || ''}${beefyIcon}`,
  },
  autoConnect: {
    injected: ['xyz.farcaster.', 'com.coinbase.'],
  },
  initial: [
    browserWallet({
      identifiers: [
        {
          id: 'injected.rabby',
          rdns: 'io.rabby',
          name: 'Rabby',
          iconUrl: async () =>
            (await import('../../../../images/wallets/binance-wallet.svg')).default,
          flags: 'isRabby',
        },
        {
          id: 'injected.binance',
          name: 'Binance',
          iconUrl: async () =>
            (await import('../../../../images/wallets/binance-wallet.svg')).default,
          flags: 'isBinance',
        },
        {
          id: 'injected.core',
          name: 'Core',
          iconUrl: async () => (await import('../../../../images/wallets/core-wallet.svg')).default,
          flags: 'isAvalanche',
        },
        {
          id: 'injected.bitkeep',
          name: 'BitKeep',
          iconUrl: async () =>
            (await import('../../../../images/wallets/bitkeep-wallet.png')).default,
          flags: 'isBitKeep',
        },
        {
          id: 'injected.cdc-defi',
          name: 'CDC DeFi',
          iconUrl: async () => (await import('../../../../images/wallets/crypto.png')).default,
          flags: ['isDeficonnectProvider', 'isTrust'],
          matcher: state => state.isDeficonnectProvider && !state.isTrust,
        },
        {
          id: 'injected.trust',
          name: 'Trust Wallet',
          iconUrl: async () =>
            (await import('../../../../images/wallets/trust-wallet.svg')).default,
          flags: 'isTrust',
        },
        {
          /** Keep MetaMask last as most other wallets have isMetaMask set to true also */
          id: 'injected.metamask',
          name: 'MetaMask',
          rdns: ['io.metamask'],
          iconUrl: async () => (await import('../../../../images/wallets/metamask.svg')).default,
          flags: [
            'isMetaMask',
            'isApexWallet',
            'isAvalanche',
            'isBitKeep',
            'isBlockWallet',
            'isKuCoinWallet',
            'isMathWallet',
            'isOkxWallet',
            'isOKExWallet',
            'isOneInchIOSWallet',
            'isOneInchAndroidWallet',
            'isOpera',
            'isPhantom',
            'isPortal',
            'isRabby',
            'isTokenPocket',
            'isTokenary',
            'isUniswapWallet',
            'isZerion',
          ],
          matcher: (state, flags) =>
            state.isMetaMask && !flags.some(flag => state[flag] === true && flag !== 'isMetaMask'),
        },
      ],
    }),
    browserWallet({
      injectedAt: 'okxwallet',
      identifiers: [
        {
          id: 'injected.okxwallet',
          name: 'OKX Wallet',
          iconUrl: async () => (await import('../../../../images/wallets/okx-wallet.svg')).default,
        },
      ],
    }),
  ],
  lazy: [
    walletConnectWallet({ projectId: 'af38b343e1be64b27c3e4a272cb453b9' }),
    fireblocksWallet({
      projectId: 'af38b343e1be64b27c3e4a272cb453b9',
      priority: SORT_PRIORITY_DEFAULT + 10,
    }),
    baseAccountWallet(),
    coinbaseWallet(),
    metaMaskWallet(),
  ],
});
