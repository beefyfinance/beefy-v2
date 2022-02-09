import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { connectors, ICoreOptions, IProviderOptions } from 'web3modal';
import { CloverConnector } from '@clover-network/clover-connector';
import WalletLink from 'walletlink';
import Web3 from 'web3';
import { ChainEntity } from '../entities/chain';
import { find, sample } from 'lodash';

export interface WalletConnectOptions {
  chains: ChainEntity[];
  onWalletDisconnected: () => Promise<unknown> | unknown;
  onConnect: (chainId: ChainEntity['id'], address: string) => Promise<unknown> | unknown;
  onAccountChanged: (address: string) => Promise<unknown> | unknown;
  onChainChanged: (chainId: ChainEntity['id']) => Promise<unknown> | unknown;
  onUnsupportedChainSelected: (networkChainId: number | string) => Promise<unknown> | unknown;
}

export class WalletConnect {
  protected web3Modal: Web3Modal | null;

  constructor(protected options: WalletConnectOptions) {
    this.web3Modal = null;
  }

  /**
   * Ask the user to connect if he isn't already
   * @param suggestedChainId we will use this chain to detect providers but user can be successfully connected to another chain
   */
  public async askUserToConnectIfNeeded(suggestedChainId: ChainEntity['id']) {
    const chain = find(this.options.chains, chain => chain.id === suggestedChainId);
    if (!chain) {
      throw new Error(`Couldn't find chain by id ${suggestedChainId}`);
    }
    // initialize instances if needed
    if (this.web3Modal === null) {
      const providerOptions = _generateProviderOptions(chain);
      this.web3Modal = new Web3Modal(providerOptions);
    }

    // open modal if needed to connect
    await this._openWeb3Modal();
  }

  public askUserForChainChangeIfNeeded(chainId: ChainEntity['id']) {
    const chain = find(this.options.chains, chain => chain.id === chainId);
    if (!chain) {
      throw new Error(`Couldn't find chain by id ${chainId}`);
    }
    // initialize instances if needed
    if (this.web3Modal === null) {
      const providerOptions = _generateProviderOptions(chain);
      this.web3Modal = new Web3Modal(providerOptions);
    }
    // TODO
  }

  protected async _openWeb3Modal() {
    const provider = await this.web3Modal.connect();
    const web3 = await new Web3(provider);
    web3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          outputFormatter: web3.utils.hexToNumber as any,
        },
      ],
    });

    // handle provider events
    if (provider.on) {
      provider.on('close', async () => {
        await this.web3Modal.clearCachedProvider();
        return this.options.onWalletDisconnected();
      });
      provider.on('disconnect', async () => {
        await this.web3Modal.clearCachedProvider();
        return this.options.onWalletDisconnected();
      });
      provider.on('accountsChanged', async (accounts: Array<string | undefined>) => {
        const address = accounts[0];

        console.debug(`WalletAPI: account changed: ${address}`);

        if (address === undefined) {
          await this.web3Modal.clearCachedProvider();
          return this.options.onWalletDisconnected();
        } else {
          return this.options.onAccountChanged(address);
        }
      });
      provider.on('chainChanged', async (chainIdOrHexChainId: string) => {
        console.debug(`WalletAPI: chain changed: ${chainIdOrHexChainId}`);

        const networkChainId = web3.utils.isHex(chainIdOrHexChainId)
          ? web3.utils.hexToNumber(chainIdOrHexChainId)
          : chainIdOrHexChainId;

        const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);
        if (chain) {
          return this.options.onChainChanged(chain.id);
        } else {
          return this.options.onUnsupportedChainSelected(networkChainId);
        }
      });
    }

    let networkChainId = await web3.eth.getChainId();
    if (networkChainId === 86) {
      // Trust provider returns an incorrect chainId for BSC.
      networkChainId = 56;
    }

    const chain = find(this.options.chains, chain => chain.networkChainId === networkChainId);
    if (chain) {
      const accounts = await web3.eth.getAccounts();
      return this.options.onConnect(chain.id, accounts[0]);
    } else {
      return this.options.onUnsupportedChainSelected(networkChainId);
    }
  }
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
        logo: require(`../../../images/wallets/binance-wallet.png`).default,
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
        logo: require(`../../../images/wallets/clover.png`).default,
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
        logo: require(`../../../images/wallets/coinbase.png`).default,
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
        logo: require(`../../../images/wallets/wallet-connect.svg`).default,
        name: 'Wallet Connect',
        description: 'Scan your WalletConnect to Connect',
      },
      options: {
        rpc: { chainId: chain.rpc },
      },
      package: WalletConnectProvider,
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
        logo: require(`../../../images/wallets/math-wallet.svg`).default,
      },
      package: 'math',
      connector: connectors.injected,
    },
    'custom-twt': {
      display: {
        name: 'Trust',
        description: 'Trust Wallet',
        logo: require(`../../../images/wallets/trust-wallet.svg`).default,
      },
      package: 'twt',
      connector: connectors.injected,
    },
    'custom-safepal': {
      display: {
        name: 'SafePal',
        description: 'SafePal App',
        logo: require(`../../../images/wallets/safepal-wallet.svg`).default,
      },
      package: 'safepal',
      connector: connectors.injected,
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
