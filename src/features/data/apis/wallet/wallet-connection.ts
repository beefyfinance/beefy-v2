import createCoinbaseWalletModule from '@web3-onboard/coinbase';
import type { WalletInit } from '@web3-onboard/common';
import { createEIP1193Provider } from '@web3-onboard/common';
import type { ChainListener, WalletHelpers } from '@web3-onboard/common/dist/types';
import type { EIP1193Provider, OnboardAPI } from '@web3-onboard/core';
import Onboard from '@web3-onboard/core';
import type { ConnectOptions } from '@web3-onboard/core/dist/types';
import createInjectedWallets from '@web3-onboard/injected-wallets';
import type {
  EIP6963AnnounceProviderEvent,
  InjectedNameSpace,
} from '@web3-onboard/injected-wallets/dist/types';
import standardInjectedWallets from '@web3-onboard/injected-wallets/dist/wallets';
import createMetamaskModule from '@web3-onboard/metamask';
import createTrustDesktopModule from '@web3-onboard/trust';
import createWalletConnectModule from '@web3-onboard/walletconnect';
import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import { find, sample, uniq } from 'lodash-es';
import { createWalletClient, custom, isHex, numberToHex } from 'viem';
import { maybeHexToNumber } from '../../../../helpers/format.ts';
import { getNetworkSrc } from '../../../../helpers/networkSrc.ts';
import appIcon from '../../../../images/bifi-logos/header-logo-notext.svg';
import appLogo from '../../../../images/bifi-logos/header-logo.svg';
import fireblocksLogo from '../../../../images/wallets/fireblocks.svg?url';
import type { ChainEntity } from '../../entities/chain.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { featureFlag_walletConnectChainId } from '../../utils/feature-flags.ts';
import { withDivvi } from '../divvi/client.ts';
import { customInjectedWallets } from './custom-injected-wallets.ts';
import type { IWalletConnectionApi, WalletConnectionOptions } from './wallet-connection-types.ts';

declare const window: {
  [K in InjectedNameSpace]?: unknown;
} & Window &
  typeof globalThis;

const walletConnectImages: Record<string, string> = {
  '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489': fireblocksLogo,
};

function isEip6963Event(e: Event): e is EIP6963AnnounceProviderEvent {
  return (
    e.type === 'eip6963:announceProvider' &&
    typeof (e as EIP6963AnnounceProviderEvent).detail?.info?.rdns === 'string' &&
    typeof (e as EIP6963AnnounceProviderEvent).detail?.provider === 'object'
  );
}

const eip6936WalletPriority = ['xyz.farcaster.', 'com.coinbase.'];

export class WalletConnectionApi implements IWalletConnectionApi {
  protected onboard: OnboardAPI | undefined;
  protected onboardWalletInitializers: WalletInit[] | undefined;
  protected ignoreDisconnectFromAutoConnect = false;
  protected providerWrapper: ((provider: EIP1193Provider) => EIP1193Provider) | undefined;
  protected tryToAutoConnectToEip6936: boolean = false;
  protected eip6963Wallets = new Map<string, string>();

  constructor(protected options: WalletConnectionOptions) {
    this.onboard = undefined;
    this.onboardWalletInitializers = undefined;
    this.listenForEip6963Wallets();
  }

  protected listenForEip6963Wallets() {
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'eip6963:announceProvider',
        this.onEip6963AnnounceProvider.bind(this)
      );
      window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));
    }
  }

  protected onEip6963AnnounceProvider(e: Event): void {
    if (!isEip6963Event(e)) {
      return;
    }

    this.eip6963Wallets.set(e.detail.info.rdns, e.detail.info.name);
  }

  /** set whether next tryToAutoConnect will try to automatically connect to EIP6936 wallet */
  public setAutoConnectToEip6936(value: boolean = true) {
    this.tryToAutoConnectToEip6936 = value;
  }

  private static createWalletConnectModule(
    modalOptions?: WalletConnectOptions['qrModalOptions']
  ): WalletInit {
    const requiredChainId = featureFlag_walletConnectChainId();
    const options: WalletConnectOptions = {
      dappUrl: 'https://app.beefy.com',
      projectId: 'af38b343e1be64b27c3e4a272cb453b9',
      requiredChains: requiredChainId ? [requiredChainId] : [],
    };

    if (modalOptions) {
      options.qrModalOptions = modalOptions;
    } else {
      options.qrModalOptions = {
        walletImages: walletConnectImages,
      };
    }

    return createWalletConnectModule(options);
  }

  private static createWalletConnectFireblocksModule(): WalletInit {
    const walletConnectInit = WalletConnectionApi.createWalletConnectModule({
      mobileWallets: [
        {
          id: '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489',
          name: 'Fireblocks',
          links: {
            native: 'fireblocks-wc://',
            universal: 'https://console.fireblocks.io/v2/',
          },
        },
      ],
      desktopWallets: [
        {
          id: '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489',
          name: 'Fireblocks',
          links: {
            native: 'fireblocks-wc://',
            universal: 'https://console.fireblocks.io/v2/',
          },
        },
      ],
      enableExplorer: false,
      walletImages: walletConnectImages,
    });

    return (helpers: WalletHelpers) => {
      const module = walletConnectInit(helpers);
      if (!module || Array.isArray(module)) {
        throw new Error('createWalletConnectModule returned invalid module');
      }

      module.label = 'Fireblocks';
      module.getIcon = async () =>
        (await import('../../../../images/wallets/fireblocks-transparent.svg')).default;

      return module;
    };
  }

  private static createMetamaskModule(): WalletInit {
    return createMetamaskModule({
      options: {
        enableAnalytics: false,
        checkInstallationImmediately: false,
        extensionOnly: false,
        dappMetadata: {
          name: 'Beefy',
          url: 'https://app.beefy.com',
          base64Icon:
            'data:image/png;base64,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',
        },
      },
    });
  }

  /**
   * Create list of wallet modules for Onboard
   * @private
   */
  private static createOnboardWalletInitializers() {
    return [
      WalletConnectionApi.createInjectedWalletsModule(),
      WalletConnectionApi.createWalletConnectModule(),
      WalletConnectionApi.createMetamaskModule(),
      createCoinbaseWalletModule(),
      WalletConnectionApi.createCDCWalletModule(),
      createTrustDesktopModule(),
      WalletConnectionApi.createWalletConnectFireblocksModule(),
    ];
  }

  private static createInjectedWalletsModule() {
    return createInjectedWallets({
      custom: customInjectedWallets,
      disable6963Support: false,
    });
  }

  private static createCDCWalletModule(): WalletInit {
    return () => ({
      label: 'CDC Connect',
      getIcon: async () => (await import('../../../../images/wallets/crypto.png')).default,
      getInterface: async ({ chains }) => {
        const { DeFiWeb3Connector } = await import('@deficonnect/web3-connector');
        const cronosChainId = 25;

        const connector = new DeFiWeb3Connector({
          appName: 'Beefy',
          chainType: 'eth',
          chainId: cronosChainId.toString(),
          supportedChainIds: chains.map(chain => maybeHexToNumber(chain.id)),
          rpcUrls: Object.fromEntries(
            chains.map(chain => {
              if (!chain.rpcUrl) {
                throw new Error(`Chain ${chain.id} is missing rpcUrl`);
              }
              return [chain.id.toString(), chain.rpcUrl];
            })
          ),
        });

        const { provider } = await connector.activate();

        // Patch missing/non-conforming methods
        const patchedProvider = createEIP1193Provider(provider, {
          eth_requestAccounts: async ({ baseRequest }) => {
            return await baseRequest({ method: 'eth_accounts' });
          },
          eth_chainId: async ({ baseRequest }) => {
            const value = await baseRequest({ method: 'eth_chainId' });
            return isHex(value, { strict: true }) ? value : (
                `0x${parseInt(value + '', 10).toString(16)}`
              );
          },
        });

        // Patch non-conforming events
        const originalOn = patchedProvider.on.bind(patchedProvider);
        patchedProvider.on = (event, listener) => {
          if (event === 'chainChanged') {
            originalOn(event, value => {
              // call original handler with modified value -- chainId: Dec->Hex
              (listener as ChainListener)(
                isHex(value, { strict: true }) ? value : (
                  `0x${parseInt(value + '', 10).toString(16)}`
                )
              );
            });
          } else {
            originalOn(event as never, listener as never);
          }
        };

        // DeFiConnectorProvider type is missing EventEmitter type
        return {
          provider: patchedProvider,
        };
      },
    });
  }

  private static setLastConnectedWallet(wallet: string | undefined) {
    try {
      if (wallet) {
        window?.localStorage?.setItem('lastConnectedWallet', wallet);
      } else {
        window?.localStorage?.removeItem('lastConnectedWallet');
      }
    } catch {
      // silently ignore
    }
  }

  private static getLastConnectedWallet(): string | undefined {
    try {
      return window?.localStorage?.getItem('lastConnectedWallet') || undefined;
    } catch {
      return undefined;
    }
  }

  private static async connect(onboard: OnboardAPI, options?: ConnectOptions) {
    const wallets = await onboard.connectWallet(options);

    if (!wallets.length) {
      console.error('connect: No wallet connected');
      throw new Error('No wallet connected');
    }

    const wallet = wallets[0];
    if (!wallet.accounts.length) {
      console.error('connect: No account connected');
      throw new Error('No account connected');
    }

    if (!wallet.provider) {
      console.error('connect: No provider for wallet');
      throw new Error('No provider for wallet');
    }
  }

  private static clearWalletConnectStorage() {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('wc@2:')) {
          toRemove.push(key);
        }
      }
      for (const key of toRemove) {
        localStorage.removeItem(key);
      }
    } catch {
      // ignored
    }
  }

  protected getEip6963Wallet() {
    if (this.eip6963Wallets.size === 0) {
      return undefined;
    }

    for (const rdns of eip6936WalletPriority) {
      const wallet = this.eip6963Wallets.get(rdns);
      if (wallet) {
        return wallet;
      }
    }

    return sample(Array.from(this.eip6963Wallets.values()));
  }

  protected async getWalletForAutoConnect() {
    // Use last connected wallet if set
    const lastConnectedWallet = WalletConnectionApi.getLastConnectedWallet();
    if (lastConnectedWallet) {
      // wait for injected wallet to be available in case last connected was an injected wallet
      await this.waitForInjectedWallet();
      return lastConnectedWallet;
    }

    // Try to auto connect if wallet announced via EIP-6963
    if (this.tryToAutoConnectToEip6936 && this.eip6963Wallets.size > 0) {
      this.tryToAutoConnectToEip6936 = false;
      return this.getEip6963Wallet();
    }

    return undefined;
  }

  /**
   * Attempt to reconnect to cached provider
   */
  public async tryToAutoReconnect() {
    // Skip if already connected
    if (this.isConnected()) {
      console.debug('tryToAutoReconnect: Already connected');
      return;
    }

    // Must have last selected wallet set
    const autoConnectWallet = await this.getWalletForAutoConnect();
    if (!autoConnectWallet) {
      console.debug('tryToAutoReconnect: No autoConnectWallet');
      return;
    }

    // Initialize onboard if needed
    const onboard = this.getOnboard();

    // Attempt to connect
    try {
      console.debug(`tryToAutoReconnect: Trying ${autoConnectWallet}`);
      this.ignoreDisconnectFromAutoConnect = true;
      await WalletConnectionApi.connect(onboard, {
        autoSelect: { label: autoConnectWallet, disableModals: true },
      });
    } catch (err) {
      // We clear last connected wallet here so that attempting to reconnect opens the modal
      // rather than trying to reconnect to previous wallet that just failed/was rejected.
      WalletConnectionApi.setLastConnectedWallet(undefined);
      // Rethrow so called knows connection failed
      throw err;
    } finally {
      this.ignoreDisconnectFromAutoConnect = false;
    }
  }

  public async getConnectedViemClient() {
    if (!this.isConnected()) {
      throw new Error(`Wallet not connected.`);
    }

    const onboard = this.getOnboard();
    const wallet = onboard.state.get().wallets[0];
    const realProvider: EIP1193Provider = wallet.provider;

    /*
     * this is a hack to extract calls to the provider for use in Tenderly simulations
     * withProviderWrapper(), which sets providerWrapper, is only called from Tenderly actions
     * otherwise providerWrapper is undefined and the original unmodified provider is used
     */
    const wrappedProvider =
      this.providerWrapper ? this.providerWrapper(realProvider) : realProvider;

    return withDivvi(
      createWalletClient({
        transport: custom(wrappedProvider),
      })
    );
  }

  public async withProviderWrapper<T>(
    wrapFn: (provider: EIP1193Provider) => EIP1193Provider,
    callback: () => Promise<T>
  ) {
    try {
      this.providerWrapper = wrapFn;
      return await callback();
    } finally {
      this.providerWrapper = undefined;
    }
  }

  /**
   * Ask the user to connect if he isn't already
   */
  public async askUserToConnectIfNeeded() {
    if (this.isConnected()) {
      console.debug('askUserToConnectIfNeeded: Already connected');
      throw new Error('Already connected');
    }

    // initialize onboard if needed
    const onboard = this.getOnboard();

    // Automatically pick last connected wallet if available
    const autoConnectWallet = await this.getWalletForAutoConnect();

    // Connect
    try {
      await WalletConnectionApi.connect(
        onboard,
        autoConnectWallet ?
          { autoSelect: { label: autoConnectWallet, disableModals: false } }
        : undefined
      );
    } catch (err) {
      // We clear last connected wallet here so that attempting to reconnect opens the modal
      // rather than trying to reconnect to previous wallet that just failed/was rejected.
      WalletConnectionApi.setLastConnectedWallet(undefined);
      // Rethrow so called knows connection failed
      throw err;
    }
  }

  /**
   * Whether wallet is currently connected + address available
   */
  public isConnected(): boolean {
    if (!this.onboard) {
      return false;
    }

    const { wallets } = this.onboard.state.get();
    return (
      wallets.length > 0 &&
      wallets[0].accounts.length > 0 &&
      wallets[0].chains.length > 0 &&
      !!wallets[0].provider
    );
  }

  /**
   * Attempt to allow user to manually switch networks
   * @param chainId
   */
  public async askUserForChainChange(chainId: ChainEntity['id']) {
    const chain = find(this.options.chains, chain => chain.id === chainId);
    if (!chain) {
      console.error(`askUserForChainChange: Couldn't find chain by id ${chainId}`);
      throw new Error(`Couldn't find chain by id ${chainId}`);
    }

    // Onboard must already be connected
    if (!this.isConnected()) {
      console.error('askUserForChainChange: Not connected');
      throw new Error(`Wallet must be connected before switching chains`);
    }

    // Change chain
    const onboard = this.getOnboard();
    const success = await onboard.setChain({ chainId: numberToHex(chain.networkChainId) });
    if (!success) {
      console.error('askUserForChainChange: Failed to switch chain');
      throw new Error(`Failed to switch chain`);
    }
  }

  public async disconnect() {
    // Disconnect Wallet
    if (this.onboard) {
      const { wallets } = this.onboard.state.get();
      if (wallets.length) {
        await this.onboard.disconnectWallet({ label: wallets[0].label });
      }
    }

    // Clear last wallet
    WalletConnectionApi.setLastConnectedWallet(undefined);

    // Clear wallet connect storage or else it will try to reconnect to same session
    WalletConnectionApi.clearWalletConnectStorage();

    // Don't try to auto connect next time
    this.tryToAutoConnectToEip6936 = false;

    // Raise events
    this.options.onWalletDisconnected();
  }

  private getOnboardWalletInitializers(): WalletInit[] {
    if (this.onboardWalletInitializers === undefined) {
      this.onboardWalletInitializers = WalletConnectionApi.createOnboardWalletInitializers();
    }
    return this.onboardWalletInitializers;
  }

  /**
   * Create instance of Onboard
   * @private
   */
  private createOnboard() {
    const onboard = Onboard({
      disableFontDownload: true,
      connect: {
        showSidebar: true,
        removeWhereIsMyWalletWarning: true,
        autoConnectAllPreviousWallet: false,
        autoConnectLastWallet: false,
      },
      wallets: this.getOnboardWalletInitializers(),
      theme: {
        '--w3o-background-color': '#1A1D26',
        '--w3o-foreground-color': '#242835',
        '--w3o-text-color': '#EFF1FC',
        '--w3o-border-color': 'transparent',
        '--w3o-action-color': '#59A662',
        '--w3o-border-radius': '8px',
      },
      appMetadata: {
        name: 'Beefy',
        icon: appIcon,
        logo: appLogo,
        description:
          'Beefy is a Decentralized, Multichain Yield Optimizer that allows its users to earn compound interest on their crypto holdings. Beefy earns you the highest APYs with safety and efficiency in mind.',
        gettingStartedGuide: 'https://docs.beefy.finance/',
        explore: 'https://beefy.com/',
      },
      chains: this.options.chains.map(chain => ({
        id: numberToHex(chain.networkChainId),
        token: chain.native.symbol,
        label: chain.name,
        rpcUrl: sample(chain.rpc),
        blockExplorerUrl: chain.explorerUrl,
        icon: getNetworkSrc(chain.id),
      })),
      accountCenter: {
        hideTransactionProtectionBtn: true,
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        },
      },
    });

    this.subscribeToOnboardEvents(onboard);

    return onboard;
  }

  /**
   * Subscribe to events so we can notify app on chain/account change + disconnect
   * @param onboard
   * @private
   */
  private subscribeToOnboardEvents(onboard: OnboardAPI) {
    const wallets = onboard.state.select('wallets');
    return wallets.subscribe(wallets => {
      if (wallets.length === 0) {
        if (this.ignoreDisconnectFromAutoConnect) {
          console.debug('Ignoring disconnect event from auto reconnect wallet attempt');
          return (this.ignoreDisconnectFromAutoConnect = false);
        }
        this.options.onWalletDisconnected();
      } else {
        const wallet = wallets[0];

        if (wallet.accounts.length === 0 || wallet.chains.length === 0) {
          this.options.onWalletDisconnected();
        } else {
          // Save last connected wallet
          WalletConnectionApi.setLastConnectedWallet(wallet.label);

          // Raise events
          const account = wallet.accounts[0];
          const networkChainId = maybeHexToNumber(wallet.chains[0].id);
          const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);

          if (chain) {
            this.options.onChainChanged(chain.id, account.address);
          } else {
            this.options.onUnsupportedChainSelected(networkChainId, account.address);
          }
        }
      }
    });
  }

  /**
   * Lazy-init onboard instance
   * @private
   */
  private getOnboard() {
    if (this.onboard === undefined) {
      this.onboard = this.createOnboard();
    }

    return this.onboard;
  }

  private async waitForInjectedWallet(
    maxWait: number = 3000,
    checkInterval: number = 200
  ): Promise<boolean> {
    if (this.eip6963Wallets.size > 0) {
      console.debug('wallet: eip6963 already present');
      return true;
    }

    const injectedNamespaces = uniq(
      [...customInjectedWallets, ...standardInjectedWallets].map(wallet => wallet.injectedNamespace)
    ).filter(isDefined);
    const anyNamespaceExists = () => {
      if (window) {
        for (const namespace of injectedNamespaces) {
          if (window[namespace]) {
            return true;
          }
        }
      }

      return false;
    };

    if (anyNamespaceExists()) {
      console.debug('wallet: exists at start');
      return true;
    }

    return new Promise<boolean>(resolve => {
      const startTime = Date.now();
      const handle = setInterval(() => {
        if (Date.now() - startTime > maxWait) {
          console.debug('wallet: max wait');
          clearInterval(handle);
          return resolve(false);
        }

        if (anyNamespaceExists()) {
          console.debug('wallet: exists now');
          clearInterval(handle);
          return resolve(true);
        }
      }, checkInterval);
    });
  }
}
