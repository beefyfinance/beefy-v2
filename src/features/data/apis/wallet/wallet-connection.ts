import Web3 from 'web3';
import { ChainEntity } from '../../entities/chain';
import { find, sample, uniq } from 'lodash';
import { IWalletConnectionApi, WalletConnectionOptions } from './wallet-connection-types';
import { maybeHexToNumber } from '../../../../helpers/format';
import { isHexStrict, numberToHex } from 'web3-utils';
import Onboard, { OnboardAPI } from '@web3-onboard/core';
import createInjectedWallets from '@web3-onboard/injected-wallets';
import standardInjectedWallets from '@web3-onboard/injected-wallets/dist/wallets';
import createCoinbaseWalletModule from '@web3-onboard/coinbase';
import createWalletConnectModule from '@web3-onboard/walletconnect';
import { ConnectOptions } from '@web3-onboard/core/dist/types';
import { createEIP1193Provider, WalletInit } from '@web3-onboard/common';
import { customInjectedWallets } from './custom-injected-wallets';
import { createWeb3Instance } from '../../../../helpers/web3';

export class WalletConnectionApi implements IWalletConnectionApi {
  protected onboard: OnboardAPI | null;
  protected onboardWalletInitializers: WalletInit[] | null;
  protected ignoreDisconnectFromAutoConnect = false;

  constructor(protected options: WalletConnectionOptions) {
    this.onboard = null;
    this.onboardWalletInitializers = null;
  }

  private getOnboardWalletInitializers(): WalletInit[] {
    if (this.onboardWalletInitializers === null) {
      this.onboardWalletInitializers = WalletConnectionApi.createOnboardWalletInitializers();
    }
    return this.onboardWalletInitializers;
  }

  /**
   * Create list of wallet modules for Onboard
   * @private
   */
  private static createOnboardWalletInitializers() {
    return [
      WalletConnectionApi.createInjectedWalletsModule(),
      createWalletConnectModule(),
      createCoinbaseWalletModule(),
      WalletConnectionApi.createCDCWalletModule(),
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
          rpcUrls: Object.fromEntries(chains.map(chain => [chain.id.toString(), chain.rpcUrl])),
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
        name: 'Beefy Finance',
        icon: require(`../../../../images/bifi-logos/header-logo-notext.svg`).default,
        logo: require(`../../../../images/bifi-logos/header-logo.svg`).default,
        description:
          'Beefy is a Decentralized, Multichain Yield Optimizer that allows its users to earn compound interest on their crypto holdings. Beefy earns you the highest APYs with safety and efficiency in mind.',
        gettingStartedGuide: 'https://docs.beefy.finance/',
      },
      chains: this.options.chains.map(chain => ({
        id: numberToHex(chain.networkChainId),
        token: chain.walletSettings.nativeCurrency.symbol,
        label: chain.name,
        rpcUrl: sample(chain.rpc),
        blockExplorerUrl: chain.explorerUrl,
        icon: require(`../../../../images/networks/${chain.id}.svg`).default,
      })),
      accountCenter: {
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

  private static setLastConnectedWallet(wallet: string | null) {
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

  private static getLastConnectedWallet(): string | null {
    try {
      return window?.localStorage?.getItem('lastConnectedWallet');
    } catch {
      return null;
    }
  }

  /**
   * Lazy-init onboard instance
   * @private
   */
  private getOnboard() {
    if (this.onboard === null) {
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
      WalletConnectionApi.setLastConnectedWallet(null);
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

    const wallet = this.onboard.state.get().wallets[0];
    return createWeb3Instance(wallet.provider as any);
  }

  /**
   * Ask the user to connect if he isn't already
   */
  public async askUserToConnectIfNeeded(isAutoConnect: boolean = false) {
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
      WalletConnectionApi.setLastConnectedWallet(null);
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
    const success = await this.onboard.setChain({ chainId: numberToHex(chain.networkChainId) });
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
    WalletConnectionApi.setLastConnectedWallet(null);

    // Raise events
    this.options.onWalletDisconnected();
  }
}
