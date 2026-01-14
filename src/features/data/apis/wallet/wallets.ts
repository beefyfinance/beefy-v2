import type { Wallet, WalletInit, WalletInitOptions } from './wallet-types.ts';
import beefyIcon from '../../../../images/miniapp/icon.png?url';
import { browserWallet } from './wallets/browserWallet.ts';
import { walletConnectWallet } from './wallets/walletConnectWallet.ts';
import { fireblocksWallet } from './wallets/fireblocksWallet.ts';
import { baseAccountWallet } from './wallets/baseAccountWallet.ts';
import { coinbaseWallet } from './wallets/coinbaseWallet.ts';
import { metaMaskWallet } from './wallets/metamaskWallet.ts';
import { type Config, createConfig, createStorage, type Register } from '@wagmi/core';
import { viemChains } from '../chains/viem.ts';
import { createClient, fallback, http, type Transport } from 'viem';
import { getBatchOptionsForRpc } from '../viem/transports/transports.ts';
import type { injected } from '@wagmi/connectors';
import { safeAppWallet } from './wallets/safeAppWallet.ts';
import { safeWallet } from './wallets/safeWallet.ts';
import { trustWallet } from './wallets/trustWallet.ts';
import { cdcWallet } from './wallets/cdcWallet.ts';

/** this gives strict type checking on wagmi methods */
declare module '@wagmi/core' {
  interface Register {
    config: Config<
      typeof viemChains,
      Record<(typeof viemChains)[number]['id'], Transport>,
      ReturnType<typeof injected>[]
    >;
  }
}

type CreateWalletsConfigParameters = {
  /** options passed to wallet init methods */
  options: WalletInitOptions;
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

export type WalletsConfig = Omit<CreateWalletsConfigParameters, 'initial'> & {
  initial: Wallet[];
  wagmi: Register['config'];
};

const walletConnectProjectId: string = 'af38b343e1be64b27c3e4a272cb453b9';

function createWalletsConfig(input: CreateWalletsConfigParameters): WalletsConfig {
  const { initial, options, ...rest } = input;
  const initialWallets = initial.map(init => init(options));
  const wagmi = createConfig({
    multiInjectedProviderDiscovery: true,
    syncConnectedChain: true,
    ssr: false,
    chains: viemChains,
    connectors: initialWallets.map(wallet => wallet.createConnector),
    storage: createStorage({ storage: window.localStorage }),
    client({ chain }) {
      const options = chain.beefy.transport;

      // TODO reuse rpcClientManager
      // @dev this returns a Client (not PublicClient/WalletClient) so you need to use action(client, opts) rather than client.action(opts)
      return createClient({
        chain,
        transport: fallback(
          chain.rpcUrls.default.http.map(url =>
            http(url, {
              timeout: options.timeout,
              retryDelay: options.retryDelay,
              retryCount: 0, // we retry in fallback after trying all rpcs
              batch: getBatchOptionsForRpc(url),
            })
          ),
          {
            retryCount: options.retryCount,
            retryDelay: options.retryDelay,
          }
        ),
        batch: {
          multicall: options.multicall,
        },
      });
      // return rpcClientManager.getBatchClient(chainId) as Client<Transport, (typeof viemChains)[number]>;
    },
  });

  return {
    ...rest,
    options,
    initial: initialWallets,
    wagmi,
  };
}

export const walletsConfig = createWalletsConfig({
  options: {
    app: {
      name: 'Beefy',
      description: 'Earn the highest APYs on your crypto with safety and efficiency in mind',
      url: window?.location.origin || 'https://app.beefy.com',
      icon: `${window?.location.origin || ''}${beefyIcon}`,
    },
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
          iconUrl: async () => (await import('../../../../images/wallets/rabby.svg')).default,
          flags: 'isRabby',
        },
        {
          id: 'injected.binance',
          rdns: 'com.binance.wallet',
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
          rdns: 'com.crypto.wallet',
          name: 'CDC DeFi',
          iconUrl: async () => (await import('../../../../images/wallets/crypto.png')).default,
          flags: ['isDeficonnectProvider', 'isTrust'],
          matcher: state => state.isDeficonnectProvider && !state.isTrust,
        },
        {
          id: 'injected.trust',
          rdns: 'com.trustwallet.app',
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
          rdns: 'com.okex.wallet',
          name: 'OKX Wallet',
          iconUrl: async () => (await import('../../../../images/wallets/okx-wallet.svg')).default,
        },
      ],
    }),
    safeAppWallet(),
  ],
  lazy: [
    baseAccountWallet(),
    coinbaseWallet(),
    metaMaskWallet(),
    walletConnectWallet({ projectId: walletConnectProjectId }),
    safeWallet({ projectId: walletConnectProjectId }),
    trustWallet({ projectId: walletConnectProjectId }),
    cdcWallet({ projectId: walletConnectProjectId }),
    fireblocksWallet({ projectId: walletConnectProjectId }),
  ],
});
