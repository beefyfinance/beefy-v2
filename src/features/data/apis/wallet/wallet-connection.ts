import type Web3 from 'web3';
import type { ChainEntity } from '../../entities/chain';
import { find, sample, uniq } from 'lodash-es';
import type { IWalletConnectionApi, WalletConnectionOptions } from './wallet-connection-types';
import { maybeHexToNumber } from '../../../../helpers/format';
import { isHexStrict, numberToHex } from 'web3-utils';
import type { OnboardAPI } from '@web3-onboard/core';
import Onboard from '@web3-onboard/core';
import createInjectedWallets from '@web3-onboard/injected-wallets';
import standardInjectedWallets from '@web3-onboard/injected-wallets/dist/wallets';
import createCoinbaseWalletModule from '@web3-onboard/coinbase';
import createWalletConnectModule from '@web3-onboard/walletconnect';
import createMetamaskModule from '@web3-onboard/metamask';
import type { ConnectOptions } from '@web3-onboard/core/dist/types';
import type { WalletInit } from '@web3-onboard/common';
import { createEIP1193Provider } from '@web3-onboard/common';
import { customInjectedWallets } from './custom-injected-wallets';
import { createWeb3Instance } from '../../../../helpers/web3';
import appIcon from '../../../../images/bifi-logos/header-logo-notext.svg';
import appLogo from '../../../../images/bifi-logos/header-logo.svg';
import { getNetworkSrc } from '../../../../helpers/networkSrc';
import type { provider } from 'web3-core';
import { featureFlag_walletConnectChainId } from '../../utils/feature-flags';
import type { WalletHelpers } from '@web3-onboard/common/dist/types';
import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import fireblocksLogo from '../../../../images/wallets/fireblocks.svg?url'; // eslint-disable-line import/no-unresolved

const walletConnectImages: Record<string, string> = {
  '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489': fireblocksLogo,
};

export class WalletConnectionApi implements IWalletConnectionApi {
  protected onboard: OnboardAPI | undefined;
  protected onboardWalletInitializers: WalletInit[] | undefined;
  protected ignoreDisconnectFromAutoConnect = false;

  constructor(protected options: WalletConnectionOptions) {
    this.onboard = undefined;
    this.onboardWalletInitializers = undefined;
  }

  private getOnboardWalletInitializers(): WalletInit[] {
    if (this.onboardWalletInitializers === undefined) {
      this.onboardWalletInitializers = WalletConnectionApi.createOnboardWalletInitializers();
    }
    return this.onboardWalletInitializers;
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
      WalletConnectionApi.createWalletConnectFireblocksModule(),
    ];
  }

  private static createInjectedWalletsModule() {
    return createInjectedWallets({
      custom: customInjectedWallets,
    });
  }

  private static createCDCWalletModule(): WalletInit {
    return () => ({
      label: 'CDC Connect',
      getIcon: async () => (await import(`../../../../images/wallets/crypto.png`)).default,
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
            return isHexStrict(value) ? value : `0x${parseInt(value + '', 10).toString(16)}`;
          },
        });

        // Patch non-conforming events
        const originalOn = patchedProvider.on.bind(patchedProvider);
        patchedProvider.on = (event, listener) => {
          // call original handler with modified value
          originalOn(event, value => {
            // chainId: Dec->Hex
            if (event === 'chainChanged') {
              listener(isHexStrict(value) ? value : `0x${parseInt(value + '', 10).toString(16)}`);
              return;
            }
            // rest
            listener(value);
          });

          // return this
          return patchedProvider;
        };

        // DeFiConnectorProvider type is missing EventEmitter type
        return {
          provider: patchedProvider,
        };
      },
    });
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
        token: chain.walletSettings.nativeCurrency.symbol,
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
          console.log('Ignoring disconnect event from auto reconnect wallet attempt');
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

  /**
   * Attempt to reconnect to cached provider
   */
  public async tryToAutoReconnect() {
    // Skip if already connected
    if (this.isConnected()) {
      console.log('tryToAutoReconnect: Already connected');
      return;
    }

    // Must have last selected wallet set
    const lastSelectedWallet = WalletConnectionApi.getLastConnectedWallet();
    if (!lastSelectedWallet) {
      console.log('tryToAutoReconnect: No lastSelectedWallet');
      return;
    }

    // Initialize onboard if needed
    const onboard = this.getOnboard();

    // Attempt to connect
    try {
      await this.waitForInjectedWallet();
      this.ignoreDisconnectFromAutoConnect = true;
      await WalletConnectionApi.connect(onboard, {
        autoSelect: { label: lastSelectedWallet, disableModals: true },
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

  private async waitForInjectedWallet(): Promise<boolean> {
    const checkInterval = 200;
    const maxWait = 5000;
    const injectedNamespaces = uniq(
      [...customInjectedWallets, ...standardInjectedWallets].map(wallet => wallet.injectedNamespace)
    );
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
      console.log('wallet: exists at start');
      return true;
    }

    return new Promise<boolean>(resolve => {
      const startTime = Date.now();
      const handle = setInterval(() => {
        if (Date.now() - startTime > maxWait) {
          console.log('wallet: max wait');
          clearInterval(handle);
          return resolve(false);
        }

        if (anyNamespaceExists()) {
          console.log('wallet: exists now');
          clearInterval(handle);
          return resolve(true);
        }
      }, checkInterval);
    });
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

  /**
   * Provider the web3 instance for signed TXs
   */
  public async getConnectedWeb3Instance(): Promise<Web3> {
    if (!this.isConnected()) {
      throw new Error(`Wallet not connected.`);
    }

    const onboard = this.getOnboard();
    const wallet = onboard.state.get().wallets[0];
    return createWeb3Instance(wallet.provider as unknown as provider);
  }

  /**
   * Ask the user to connect if he isn't already
   */
  public async askUserToConnectIfNeeded() {
    if (this.isConnected()) {
      console.log('askUserToConnectIfNeeded: Already connected');
      throw new Error('Already connected');
    }

    // initialize onboard if needed
    const onboard = this.getOnboard();

    // Get last wallet used and make sure it is still supported
    const lastSelectedWallet = WalletConnectionApi.getLastConnectedWallet();

    // Connect
    try {
      await WalletConnectionApi.connect(
        onboard,
        lastSelectedWallet
          ? { autoSelect: { label: lastSelectedWallet, disableModals: false } }
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

    // Raise events
    this.options.onWalletDisconnected();
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
}
