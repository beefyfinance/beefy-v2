import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, {
  CACHED_PROVIDER_KEY,
  connectors,
  getLocal as getWeb3ModalLocal,
  ICoreOptions,
  IProviderOptions,
} from 'web3modal';
import { CloverConnector } from '@clover-network/clover-connector';
import WalletLink from 'walletlink';
import { DeFiConnector } from 'deficonnect';
import Web3 from 'web3';
import { ChainEntity } from '../../entities/chain';
import { find, sample } from 'lodash';
import { IWalletConnectionApi, Provider, WalletConnectionOptions } from './wallet-connection-types';
import { sleep } from '../../utils/async-utils';
import { maybeHexToNumber } from '../../../../helpers/format';

export class WalletConnectionApi implements IWalletConnectionApi {
  protected web3ModalOptions: Partial<ICoreOptions> | null;
  protected web3Modal: Web3Modal | null;
  protected provider: Provider | null;

  constructor(protected options: WalletConnectionOptions) {
    this.web3Modal = null;
    this.web3ModalOptions = null;
    this.provider = null;
  }

  private getModalOptions() {
    if (this.web3ModalOptions === null) {
      this.web3ModalOptions = _generateProviderOptions(this.options.chains);
    }

    return this.web3ModalOptions;
  }

  private getModal() {
    if (this.web3Modal === null) {
      this.web3Modal = new Web3Modal(this.getModalOptions());
    }

    return this.web3Modal;
  }

  /**
   * Attempt to reconnect to cached provider
   */
  public async tryToAutoReconnect() {
    // already connected?
    if (this.provider) {
      return;
    }

    // do we have a cached provider?
    if (!hasWeb3ModalCachedProvider()) {
      return;
    }

    // make sure the cached provider is available in options
    const cachedProvider = getWeb3ModalCachedProvider();
    const modalOptions = this.getModalOptions();
    if (!(cachedProvider in modalOptions.providerOptions)) {
      console.warn(
        'tryToAutoReconnect: cached provider not available',
        cachedProvider,
        Object.keys(modalOptions.providerOptions)
      );
      return;
    }

    // init or get modal
    const modal = this.getModal();
    // try to reconnect
    const provider = await modal.connectTo(cachedProvider);

    // make sure we have provider from modal
    if (!provider) {
      console.error('tryToAutoReconnect: provider not returned from web3modal', provider);
      throw new Error('tryToAutoReconnect: provider not returned from web3modal');
    }

    // Save provider and fire events
    this.provider = provider;
    await this.bindProviderAndRaiseEvents();
  }

  /**
   * Provider the web3 instance for signed TXs
   */
  async getConnectedWeb3Instance(): Promise<Web3> {
    if (!this.web3Modal) {
      throw new Error('Wallet not connected: missing web3Modal');
    }

    if (!this.provider) {
      throw new Error('Wallet not connected: missing provider');
    }

    return _getWeb3FromProvider(this.provider);
  }

  /**
   * Ask the user to connect if he isn't already
   */
  public async askUserToConnectIfNeeded() {
    // initialize modal if needed
    const modal = this.getModal();

    // open modal if needed to connect
    if (this.provider === null) {
      try {
        // Will open modal, or attempt to connect to cached provider
        console.log('await model.connect');
        this.provider = await modal.connect();
      } catch (err) {
        // We clear cached provider here so that attempting to reconnect opens the modal
        // rather than trying to reconnect to previous cached provider that just failed/was rejected.
        modal.clearCachedProvider();
        // Rethrow so called knows connection failed
        throw err;
      }
    }

    // raise relevant event
    await this.bindProviderAndRaiseEvents();
  }

  /**
   * Fires onConnect or onUnsupportedChainSelected
   */
  private async bindProviderAndRaiseEvents() {
    // Listen to provider events
    this._bindProviderEvents(this.provider);

    // Check chain + accounts and raise our own events
    const web3 = _getWeb3FromProvider(this.provider);
    const networkChainId = await _getNetworkChainId(web3);
    const accounts = await web3.eth.getAccounts();
    const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);

    if (chain) {
      this.options.onConnect(chain.id, accounts[0]);
    } else {
      this.options.onUnsupportedChainSelected(networkChainId, accounts[0]);
    }
  }

  /**
   * Attempt to allow user to manually switch networks
   * @param chainId
   */
  public async askUserForChainChange(chainId: ChainEntity['id']) {
    const chain = find(this.options.chains, chain => chain.id === chainId);
    if (!chain) {
      throw new Error(`Couldn't find chain by id ${chainId}`);
    }

    // Wallet must be connected before we can ask to change chains
    if (!this.web3Modal || !this.provider) {
      throw new Error(`Wallet must be connected before switching chains`);
    }

    // show add/switch chain dialog in wallets that support such
    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [chain.walletSettings],
    });
  }

  public async disconnect() {
    if (this.web3Modal) {
      this.web3Modal.clearCachedProvider();
    }

    if (this.provider && this.provider.removeAllListeners) {
      this.provider.removeAllListeners();
    }

    this.provider = null;
    this.web3Modal = null;

    this.options.onWalletDisconnected();
  }

  protected _bindProviderEvents(provider) {
    if (!provider.on) {
      console.error('Could not bind web3 events');
      return;
    }

    /**
     * sooooo, sometimes on chain change, we get a quick "disconnect"
     * event before the chainChanged event. We want to be able to tell the difference
     * between those 2 events because when we truely disconnect, we want to
     * remove event listeners. If we don't, there is a bug where the user
     * disconnects in the UI, then change chains, we will be triggered by the change chain
     * event in this case while the user is disconnected. And if we remove the
     * event listeners, right away, we never get the chainChanged event when user
     * is switching to another chain and we get a disconnect.
     *
     * The solution here is to
     *  - 1: warn the ui about the disconnection
     *  - 2: wait a bit, to see if we get a chainChanged event right after
     *  - 3: if no chainChanged, it's a true disconnect and we cleanup
     *  - 3: if chainChanged, it's a fake disconnect and we don't cleanup
     *
     * TODO: find something more reliable than timings
     */
    let gotChainChangedEvent = false;
    const onDisconnectEvent = async () => {
      gotChainChangedEvent = false;

      // first, warn the ui
      this.options.onWalletDisconnected();

      // wait a bit
      await sleep(1000);

      // cleanup if needed
      if (!gotChainChangedEvent) {
        if (this.web3Modal) {
          this.web3Modal.clearCachedProvider();
        }

        if (this.provider && this.provider.removeAllListeners) {
          this.provider.removeAllListeners();
        }

        this.provider = null;
        this.web3Modal = null;
      }
    };

    provider.on('close', onDisconnectEvent);
    provider.on('disconnect', onDisconnectEvent);
    provider.on('accountsChanged', async (accounts: Array<string | undefined>) => {
      const address = accounts[0];

      console.debug(`WalletAPI: account changed: ${address}`);

      // address undefined means user disconnected from his wallet
      if (address === undefined) {
        return this.disconnect();
      } else {
        return this.options.onAccountChanged(address);
      }
    });
    provider.on('chainChanged', async (chainIdOrHexChainId: string) => {
      console.debug(`WalletAPI: chain changed: ${chainIdOrHexChainId}`);
      gotChainChangedEvent = true;
      const web3 = _getWeb3FromProvider(this.provider);
      const networkChainId = web3.utils.isHex(chainIdOrHexChainId)
        ? web3.utils.hexToNumber(chainIdOrHexChainId)
        : chainIdOrHexChainId;

      const accounts = await web3.eth.getAccounts();
      const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);
      if (chain) {
        return this.options.onChainChanged(chain.id, accounts[0]);
      } else {
        return this.options.onUnsupportedChainSelected(networkChainId, accounts[0]);
      }
    });
  }
}

function _getWeb3FromProvider(provider) {
  const web3 = new Web3(provider);

  // Override web3.eth.getChainId to accept number strings "25" as well as hex strings "0x17"
  // eth_chainId returns "25" via Chronos Wallet Extension
  web3.eth.extend({
    methods: [
      {
        name: 'getChainId',
        call: 'eth_chainId',
        outputFormatter: maybeHexToNumber as any,
      },
    ],
  });

  return web3;
}

async function _getNetworkChainId(web3: Web3) {
  let networkChainId = await web3.eth.getChainId();
  if (networkChainId === 86) {
    // Trust provider returns an incorrect chainId for BSC.
    networkChainId = 56;
  }
  return networkChainId;
}

function _generateProviderOptions(chains: ChainEntity[]): Partial<ICoreOptions> {
  const allSupportedChainIds = chains.map(chain => chain.networkChainId);
  const allSupportedChainsIdRpcMap = Object.fromEntries(
    chains.map(chain => [chain.networkChainId, sample(chain.rpc)])
  );
  const bnbChain = chains.find(chain => chain.id === 'bsc');
  const cronosChain = chains.find(chain => chain.id === 'cronos');
  const fuseChain = chains.find(chain => chain.id === 'fuse');

  const providerOptions: IProviderOptions = {
    injected: {
      display: {
        name: 'MetaMask',
      },
    } as any /* Property 'package' is missing in this type but required in type IProviderOptions */,
    'custom-binance': {
      display: {
        name: 'Binance',
        description: 'Binance Chain Wallet',
        logo: require(`../../../../images/wallets/binance-wallet.png`).default,
      },
      package: 'binance',
      connector: async (ProviderPackage, options) => {
        const provider = (window as any).BinanceChain;
        await provider.enable();
        return provider;
      },
    },
    'custom-clover': {
      display: {
        logo: require(`../../../../images/wallets/clover.png`).default,
        name: 'Clover Wallet',
        description: 'Connect with your Clover wallet and earn CLV',
      },
      options: {
        supportedChainIds: allSupportedChainIds,
      },
      package: CloverConnector,
      connector: async (ProviderPackage, options) => {
        const provider = new ProviderPackage(options);
        await provider.activate();
        return provider.getProvider();
      },
    },
    'custom-coinbase': {
      display: {
        logo: require(`../../../../images/wallets/coinbase.png`).default,
        name: 'Coinbase Wallet',
        description: 'Connect your Coinbase Wallet',
      },
      options: {
        appName: 'Beefy Finance',
        appLogoUrl: 'https://app.beefy.finance/static/media/BIFI.e797b2e4.png',
        darkMode: false,
      },
      package: WalletLink,
      connector: async (ProviderPackage, options) => {
        const walletLink = new ProviderPackage(options);

        const provider = walletLink.makeWeb3Provider(sample(bnbChain.rpc), bnbChain.networkChainId);

        await provider.enable();

        return provider;
      },
    },
    'custom-wallet-connect': {
      display: {
        logo: require(`../../../../images/wallets/wallet-connect.svg`).default,
        name: 'Wallet Connect',
        description: 'Scan your WalletConnect to Connect',
      },
      options: {
        rpc: allSupportedChainsIdRpcMap,
      },
      package: WalletConnectProvider,
      connector: async (ProviderPackage, options) => {
        const provider = new ProviderPackage(options);

        await provider.enable();

        return provider;
      },
    },
    'custom-fuse-cash': {
      display: {
        logo: require(`../../../../images/wallets/fusecash.png`).default,
        name: 'Fuse.Cash',
        description: 'Connect to your Fuse.Cash Wallet',
      },
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: sample(fuseChain.rpc),
          [fuseChain.networkChainId]: sample(fuseChain.rpc),
        },
      },
      connector: async (ProviderPackage, options) => {
        const provider = new ProviderPackage(options);

        await provider.enable();

        return provider;
      },
    },
    'custom-math': {
      display: {
        name: 'Math',
        description: 'Math Wallet',
        logo: require(`../../../../images/wallets/math-wallet.svg`).default,
      },
      package: 'math',
      connector: connectors.injected,
    },
    'custom-twt': {
      display: {
        name: 'Trust',
        description: 'Trust Wallet',
        logo: require(`../../../../images/wallets/trust-wallet.svg`).default,
      },
      package: 'twt',
      connector: connectors.injected,
    },
    'custom-safepal': {
      display: {
        name: 'SafePal',
        description: 'SafePal App',
        logo: require(`../../../../images/wallets/safepal-wallet.svg`).default,
      },
      package: 'safepal',
      connector: connectors.injected,
    },
    'custom-cdc': {
      display: {
        logo: require(`../../../../images/wallets/crypto.png`).default,
        name: 'Crypto.com',
        description: 'Crypto.com | Wallet Extension',
      },
      options: {
        supportedChainIds: [cronosChain.networkChainId],
        rpc: {
          [cronosChain.networkChainId]: sample(cronosChain.rpc), // cronos mainet
        },
        pollingInterval: 15000,
      },
      package: DeFiConnector,
      connector: async (packageConnector, options) => {
        const connector = new packageConnector({
          name: 'Cronos',
          supprtedChainTypes: ['eth'],
          supportedChainTypes: ['eth'],
          eth: options,
          cosmos: null,
        });
        await connector.activate();
        return connector.getProvider();
      },
    },
  };

  return {
    cacheProvider: true,
    providerOptions,
  };
}

function getWeb3ModalCachedProvider() {
  return getWeb3ModalLocal(CACHED_PROVIDER_KEY) || '';
}

function hasWeb3ModalCachedProvider() {
  return getWeb3ModalCachedProvider() !== '';
}
