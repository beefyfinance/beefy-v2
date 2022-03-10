import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, {
  connectors,
  ICoreOptions,
  IProviderOptions,
  CACHED_PROVIDER_KEY,
  getLocal as getWeb3ModalLocal,
} from 'web3modal';
import { CloverConnector } from '@clover-network/clover-connector';
import WalletLink from 'walletlink';
import { DeFiConnector } from 'deficonnect';
import Web3 from 'web3';
import { ChainEntity } from '../../entities/chain';
import { find, sample } from 'lodash';
import { IWalletConnectApi, WalletConnectOptions } from './wallet-connect-types';
import { featureFlag_walletAddressOverride } from '../../utils/feature-flags';
import { sleep } from '../../utils/async-utils';

export class WalletConnectApi implements IWalletConnectApi {
  protected web3Modal: Web3Modal | null;
  protected provider: {
    on?: (eventName: string, handler: () => {}) => {};
    removeAllListeners?: () => {};
    request: (req: { method: string; params: any[] }) => Promise<void>;
  } | null;

  constructor(protected options: WalletConnectOptions) {
    this.web3Modal = null;
    this.provider = null;
  }

  public async initFromLocalCache(): Promise<null | {
    chainId: ChainEntity['id'] | null;
    address: string;
  }> {
    // we check the local cached provider
    // if we have a cached value, we want to have a connected web3Modal instance
    if (hasWeb3ModalCachedProvider()) {
      // we are already connected so we don't care about the initial chain
      const initChain = this.options.chains.find(c => c.id === 'bsc');
      const providerOptions = _generateProviderOptions(initChain);
      this.web3Modal = new Web3Modal(providerOptions);

      // this shouldn't open a modal
      this.provider = await this.web3Modal.connect();
      this._bindProviderEvents(this.provider);
      const web3 = _getWeb3FromProvider(this.provider);
      const networkChainId = await _getNetworkChainId(web3, this.provider);
      const accounts = await web3.eth.getAccounts();
      const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);
      return {
        chainId: chain ? chain.id : null,
        address: featureFlag_walletAddressOverride(accounts[0]),
      };
    } else {
      return null;
    }
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
      const initChain = find(this.options.chains, chain => chain.id === 'bsc');
      const providerOptions = _generateProviderOptions(initChain);
      this.web3Modal = new Web3Modal(providerOptions);
    }

    // open modal if needed to connect
    if (this.provider === null) {
      this.provider = await this.web3Modal.connect();
      this._bindProviderEvents(this.provider);
    }
    const web3 = _getWeb3FromProvider(this.provider);

    const networkChainId = await _getNetworkChainId(web3, this.provider);
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
      const providerOptions = _generateProviderOptions(chain);
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
    await this.web3Modal.clearCachedProvider();
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
        this.web3Modal.clearCachedProvider();
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
  web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: web3.utils.hexToNumber as any,
      },
    ],
  });
  return web3;
}

async function _getNetworkChainId(web3: Web3, provider: any) {
  let networkChainId = Number(provider.chainId || (await web3.eth.getChainId()));
  if (networkChainId === 86) {
    // Trust provider returns an incorrect chainId for BSC.
    networkChainId = 56;
  }
  return networkChainId;
}

function _generateProviderOptions(chain: ChainEntity): Partial<ICoreOptions> {
  const providerOptions: IProviderOptions = {
    injected: {
      display: {
        name: 'MetaMask',
      },
    } as any /* Property 'package' is missing in this type but required in type IProviderOptions */,
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          // pick one at random
          [chain.networkChainId]: sample(chain.rpc),
        },
      },
    },
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
        supportedChainIds: [chain.networkChainId],
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

        const provider = walletLink.makeWeb3Provider(chain.rpc, chain.networkChainId);

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
        rpc: {
          56: 'https://bsc-dataseed.binance.org/',
          43114: 'https://api.avax.network/ext/bc/C/rpc',
          137: 'https://polygon-rpc.com/',
          250: 'https://rpc.ftm.tools/',
          1666600000: 'https://api.harmony.one/',
          42161: 'https://arb1.arbitrum.io/rpc',
          1285: 'https://rpc.moonriver.moonbeam.network',
          42220: 'https://forno.celo.org',
          25: 'https://evm-cronos.crypto.org/',
          122: 'https://rpc.fuse.io',
          1088: 'https://andromeda.metis.io/?owner=1088',
          1313161554: 'https://mainnet.aurora.dev',
          1284: 'https://rpc.api.moonbeam.network',
        },
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
          1: 'https://rpc.fuse.io',
          122: 'https://rpc.fuse.io',
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
        supportedChainIds: [25],
        rpc: {
          25: 'https://evm-cronos.crypto.org/', // cronos mainet
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

  // filter by supported wallets
  const newlist: IProviderOptions = {};
  for (const key in providerOptions) {
    if (chain.supportedWallets.includes(key)) {
      newlist[key] = providerOptions[key];
    }
  }

  return {
    network: chain.providerName,
    cacheProvider: true,
    providerOptions: newlist,
  };
}

function hasWeb3ModalCachedProvider() {
  const cacheProviderValue = getWeb3ModalLocal(CACHED_PROVIDER_KEY) || '';
  return cacheProviderValue !== '';
}
