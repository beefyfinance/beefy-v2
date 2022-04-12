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
import { IWalletConnectApi, Provider, WalletConnectOptions } from './wallet-connect-types';
import { featureFlag_walletAddressOverride } from '../../utils/feature-flags';
import { sleep } from '../../utils/async-utils';
import { maybeHexToNumber } from '../../../../helpers/format';

export class WalletConnectApi implements IWalletConnectApi {
  protected web3Modal: Web3Modal | null;
  protected provider: Provider | null;

  constructor(protected options: WalletConnectOptions) {
    this.web3Modal = null;
    this.provider = null;
  }

  public async initFromLocalCache(): Promise<null | {
    chainId: ChainEntity['id'] | null;
    address: string;
  }> {
    try {
      // we check the local cached provider
      // if we have a cached value, we want to have a connected web3Modal instance
      if (hasWeb3ModalCachedProvider()) {
        const cachedProvider = getWeb3ModalCachedProvider();
        const providerOptions = _generateProviderOptions(this.options.chains);

        // make sure the cached provider is available in config
        if (cachedProvider in providerOptions.providerOptions) {
          // init modal and connect to cached provider
          this.web3Modal = new Web3Modal(providerOptions);
          // FIXME connectTo can hang indefinitely if user does not accept or cancel
          // while in this state, wallet won't be connected but app will think it is
          const provider = await this.web3Modal.connectTo(cachedProvider);

          // make sure we got provider from modal
          if (provider) {
            this.provider = provider;
            this._bindProviderEvents(this.provider);
            const web3 = _getWeb3FromProvider(this.provider);

            // make sure 1 account/address is connected
            const accounts = await web3.eth.getAccounts();
            if (accounts.length) {
              const networkChainId = await _getNetworkChainId(web3);
              const chain = find(
                this.options.chains,
                chain => chain.networkChainId === networkChainId
              );

              return {
                chainId: chain ? chain.id : null,
                address: featureFlag_walletAddressOverride(accounts[0]),
              };
            } else {
              console.error('initFromLocalCache: no accounts connected');
            }
          } else {
            console.error('initFromLocalCache: provider not returned from web3modal', provider);
          }
        } else {
          console.error(
            'initFromLocalCache: cached provider not available',
            cachedProvider,
            Object.keys(providerOptions.providerOptions)
          );
        }
      }
    } catch (err) {
      console.error('initFromLocalCache:', err);
    }

    return null;
  }

  /**
   * Extract the web3 instance
   * TODO: should not leak the instance but provide a proper api
   */
  async getConnectedWeb3Instance(): Promise<Web3> {
    if (!this.web3Modal) {
      throw new Error('Class is not initiated: missing web3Modal');
    }
    if (!this.provider) {
      throw new Error('Class is not initiated: missing provider');
    }
    return _getWeb3FromProvider(this.provider);
  }

  /**
   * Ask the user to connect if he isn't already
   * @param suggestedChainId we will use this chain to detect providers but user can be successfully connected to another chain
   */
  public async askUserToConnectIfNeeded() {
    // initialize instances if needed
    if (this.web3Modal === null) {
      const providerOptions = _generateProviderOptions(this.options.chains);
      this.web3Modal = new Web3Modal(providerOptions);
    }

    // open modal if needed to connect
    if (this.provider === null) {
      this.provider = await this.web3Modal.connect();
      this._bindProviderEvents(this.provider);
    }
    const web3 = _getWeb3FromProvider(this.provider);

    const networkChainId = await _getNetworkChainId(web3);
    const accounts = await web3.eth.getAccounts();
    const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);
    if (chain) {
      return this.options.onConnect(chain.id, accounts[0]);
    } else {
      return this.options.onUnsupportedChainSelected(networkChainId, accounts[0]);
    }
  }

  public async askUserForChainChangeIfNeeded(chainId: ChainEntity['id']) {
    const chain = find(this.options.chains, chain => chain.id === chainId);
    if (!chain) {
      throw new Error(`Couldn't find chain by id ${chainId}`);
    }
    // initialize instances if needed
    if (this.web3Modal === null) {
      const providerOptions = _generateProviderOptions(this.options.chains);
      this.web3Modal = new Web3Modal(providerOptions);
    }

    if (this.provider === null) {
      this.provider = await this.web3Modal.connect();
      this._bindProviderEvents(this.provider);
    }
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
    return this.options.onWalletDisconnected();
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
