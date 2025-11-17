import { debounce, find } from 'lodash-es';
import { type Address, type EIP1193Provider, type WalletClient } from 'viem';
import { withDivvi } from '../divvi/client.ts';
import type {
  ConnectOptions,
  IWalletConnectionApi,
  ReconnectOptions,
  WalletConnectionOptions,
  WalletEvents,
  WalletOption,
} from './wallet-connection-types.ts';
import {
  connect,
  type Connector,
  disconnect,
  getAccount,
  type GetAccountReturnType,
  getConnectors,
  type GetConnectorsReturnType,
  getWalletClient,
  reconnect,
  type Register,
  switchChain,
  watchAccount,
  watchConnectors,
} from '@wagmi/core';
import type { Wallet } from './wallet-types.ts';
import type {
  AccountConnected,
  AccountConnecting,
  AccountDisconnected,
  AccountReconnecting,
  WalletAccount,
} from '../../reducers/wallet/wallet-types.ts';
import {
  isWalletConnectionUserAbortedError,
  isWalletDuplicateRequestAbortedError,
  WalletConnectionUserAbortedError,
  WalletDuplicateRequestAbortedError,
} from './errors.ts';
import { AsyncRequests } from './AsyncRequests.ts';
import { areWalletOptionsEqual, compareWalletOptionForSort, normalizeRdns } from './helpers.ts';
import { SORT_PRIORITY_EIP6963 } from './constants.ts';
import { isDefined } from '../../utils/array-utils.ts';
import type { ChainEntity } from '../chains/entity-types.ts';
import defaultIcon from '../../../../images/wallets/browser-wallet.svg';

const eip6963Prefix = 'eip6963:';
const accountDisconnected: AccountDisconnected = {
  address: undefined,
  addresses: undefined,
  chainId: undefined,
  networkChainId: undefined,
  connector: undefined,
  isConnected: false,
  isReconnecting: false,
  isConnecting: false,
  isDisconnected: true,
  status: 'disconnected',
};

type UnsubscribeFn = () => void;

export class WalletConnectionApi implements IWalletConnectionApi {
  protected readonly chains: readonly ChainEntity[];
  protected readonly wagmi: Register['config'];
  protected readonly walletsById: Record<string, Wallet>;
  protected readonly walletToConnector: Map<string, Connector> = new Map();
  protected readonly connectorIdToWalletId: Map<string, string> = new Map();
  protected readonly events: WalletEvents;
  protected readonly connectionRequests = new AsyncRequests();
  protected readonly autoConnectRdns: Set<string> = new Set();
  protected unsubscribers: UnsubscribeFn[] = [];
  protected providerWrapper: ((provider: EIP1193Provider) => EIP1193Provider) | undefined;
  protected walletOptions: WalletOption[] = [];
  protected lastClient:
    | { account: Address; connectionId: string; client: WalletClient }
    | undefined;

  constructor({
    chains,
    wagmi,
    wallets,
    initialWalletIds,
    autoConnect,
    events,
  }: WalletConnectionOptions) {
    this.chains = chains;
    this.wagmi = wagmi;
    this.walletsById = wallets.reduce(
      (acc, wallet) => {
        acc[wallet.id] = wallet;
        return acc;
      },
      {} as Record<string, Wallet>
    );
    this.events = events;
    if (autoConnect?.injected) {
      for (const rdns of normalizeRdns(autoConnect.injected)) {
        this.autoConnectRdns.add(rdns);
      }
    }
    this.resolveAccountChanges = debounce(this.resolveAccountChanges.bind(this), 100, {
      leading: false,
      trailing: true,
      maxWait: 1000,
    });
    this.resolveConnectorChanges = debounce(this.resolveConnectorChanges.bind(this), 100, {
      leading: false,
      trailing: true,
      maxWait: 1000,
    });

    this.registerConnectorsForWallets(
      initialWalletIds.map(id => this.walletsById[id]).filter(isDefined)
    );
    this.buildInitialWalletOptions();
    this.subscribe();
    this.resolveAccountChanges(getAccount(this.wagmi));
    this.resolveConnectorChanges(getConnectors(this.wagmi));
  }

  /** subscribe to wagmi state changes */
  protected subscribe() {
    this.unsubscribers.push(
      watchAccount(this.wagmi, {
        onChange: this.resolveAccountChanges,
      }),
      watchConnectors(this.wagmi, {
        onChange: this.resolveConnectorChanges,
      })
    );
  }

  /** unsubscribe from wagmi state changes */
  protected unsubscribe() {
    for (let i = this.unsubscribers.length - 1; i >= 0; i--) {
      this.unsubscribers[i]();
    }
    this.unsubscribers = [];
  }

  /**
   * resolve account changes and emit events as needed (debounced)
   * wagmi subscription handler
   **/
  protected resolveAccountChanges(account: GetAccountReturnType) {
    let walletAccount: WalletAccount;

    if (account.status === 'disconnected') {
      walletAccount = accountDisconnected;
    } else {
      const chain = this.chains.find(c => c.networkChainId === account.chainId);
      walletAccount = {
        address: account.address,
        addresses: account.addresses,
        chainId: chain?.id,
        networkChainId: account.chainId,
        connector: account.connector,
        isConnected: account.isConnected,
        isReconnecting: account.isReconnecting,
        isConnecting: account.isConnecting,
        isDisconnected: account.isDisconnected,
        status: account.status,
      } as AccountConnected | AccountReconnecting | AccountConnecting;
    }

    this.emitAccountChanged(walletAccount);
  }

  protected emitAccountChanged(account: WalletAccount) {
    this.events.onAccountChange(account);
  }

  protected emitOptionsChanged(options: WalletOption[]) {
    this.events.onOptionsChange(options);
  }

  public cancelConnect() {
    this.connectionRequests.abortAll(new WalletConnectionUserAbortedError());
  }

  /** attempt to connect to wallet {id}, optionally on {chainId} */
  async connect({ requestId, walletId, chainId }: ConnectOptions) {
    console.log(`Connecting to wallet ${walletId} on chain ${chainId ?? 'default'}`);
    const chain = chainId ? this.chains.find(chain => chain.id === chainId) : undefined;
    const networkChainId = chain?.networkChainId || undefined;

    const option = this.walletOptions.find(w => w.id === walletId);
    if (!option) {
      throw new Error(`No wallet option with id ${walletId} found`);
    }

    const connector = this.getConnectorForWallet(walletId);
    if (!connector) {
      throw new Error(`No connector for wallet option with id ${walletId}`);
    }

    type ConnectorMessage = { uid: string; type: string; data?: unknown };
    type ConnectorMessageDisplayUri = { uid: string; type: 'display_uri'; data: string };
    const isDisplayUriMessage = (msg: ConnectorMessage): msg is ConnectorMessageDisplayUri =>
      msg.type === 'display_uri';
    const handleMessage = (message: ConnectorMessage) => {
      console.debug('handleMessage', walletId, requestId, option.id, message.data);
      if (isDisplayUriMessage(message)) {
        this.events.onConnectDisplayQr({
          requestId,
          status: 'qr',
          wallet: option,
          chainId,
          uri: message.data,
        });
      }
    };

    try {
      // abort any pending
      this.connectionRequests.abortAll(new WalletDuplicateRequestAbortedError());
      // subscribe to connector messages
      connector.emitter.on('message', handleMessage);
      // try to connect
      await this.connectionRequests.create(
        walletId,
        async () => {
          this.events.onConnectConnecting({
            requestId,
            status: 'pending',
            wallet: option,
            chainId,
          });
          await connect(this.wagmi, {
            connector,
            chainId: networkChainId,
          });
        },
        async () => {
          const walletId = this.connectorIdToWalletId.get(connector.uid);
          const wallet = walletId ? this.walletsById[walletId] : undefined;
          if (wallet?.abortAction === 'disconnect') {
            await connector.disconnect().catch(err => {
              console.warn(
                'Error during disconnect after aborted connect:',
                walletId,
                requestId,
                err
              );
            });
          }
        }
      );

      // successful connection
      this.events.onConnectSuccess({
        requestId,
        status: 'success',
        wallet: option,
        chainId,
      });
      return true;
    } catch (error) {
      console.debug('error', walletId, requestId, error);
      if (
        isWalletDuplicateRequestAbortedError(error) ||
        isWalletConnectionUserAbortedError(error)
      ) {
        console.debug(`Connection attempt to wallet ${walletId} aborted:`, error);
        // unsuccessful connection due to user abort
        this.events.onConnectCancelled({
          requestId,
          status: 'cancelled',
          wallet: option,
          chainId,
        });
        return false;
      }
      // bubble
      throw error;
    } finally {
      // unsubscribe from connector messages
      connector.emitter.off('message', handleMessage);
    }
  }

  public async disconnect() {
    this.cancelConnect();
    await disconnect(this.wagmi);
  }

  /** Every injected connector that isn't already a known wallet must be an EIP-6963 wallet */
  protected isEip6963Connector(connector: Connector) {
    return connector.type === 'injected' && !this.walletsById[connector.id];
  }

  /** when connectors change, either an eip6963 wallet was registered, or one of ours was turned in to a connector */
  protected resolveConnectorChanges(connectors: GetConnectorsReturnType) {
    const previousOptions = this.walletOptions;

    console.debug({
      previousOptions,
      connectorIdToWalletId: this.connectorIdToWalletId,
      walletToConnector: this.walletToConnector,
      connectors,
    });

    // calculate added and removed connectors
    const removed = new Set(this.connectorIdToWalletId.keys());
    const added = new Set<GetConnectorsReturnType[number]>();
    for (const connector of connectors) {
      if (!removed.delete(connector.uid)) {
        added.add(connector);
      }
    }

    // remove wallets for removed connectors
    for (const connectorUid of removed) {
      const walletId = this.connectorIdToWalletId.get(connectorUid);
      if (walletId) {
        this.walletToConnector.delete(walletId);
        this.connectorIdToWalletId.delete(connectorUid);
      }
    }

    // add wallets for added eip6963 connectors or connectors with same id as wallet
    for (const connector of added) {
      let walletId = connector.id;

      if (!this.walletsById[walletId]) {
        if (this.isEip6963Connector(connector)) {
          walletId = `${eip6963Prefix}${connector.id}`;
        } else {
          // @dev make sure the wallet and connector id match, or only lazy-init the wallet
          throw new Error(
            `No wallet with connector id "${connector.id}" and connector is not EIP-6963`
          );
        }
      }

      if (this.walletToConnector.has(walletId)) {
        console.warn(`Connector for wallet ${walletId} already registered`, connector);
      }
      if (this.connectorIdToWalletId.has(connector.uid)) {
        console.warn(
          `Connector uid ${connector.uid} already registered for wallet ${this.connectorIdToWalletId.get(
            connector.uid
          )}`,
          connector
        );
      }

      this.walletToConnector.set(walletId, connector);
      this.connectorIdToWalletId.set(connector.uid, walletId);
    }

    // Create options for any eip6963 connectors we don't already have a wallet for
    const eip6963Wallets: WalletOption[] = connectors
      .filter(c => this.isEip6963Connector(c))
      .map(c => ({
        id: `${eip6963Prefix}${c.id}`,
        name: c.name,
        iconUrl: c.icon || defaultIcon,
        iconBackground: '#fff',
        rdns: normalizeRdns(c.rdns || c.id),
        type: c.type,
        ui: 'external',
        priority: SORT_PRIORITY_EIP6963,
      }));
    const eip6963Rnds = new Set<string>(eip6963Wallets.flatMap(w => w.rdns));

    // Prefer eip6963 wallets - deduplicate by rdns
    const wallets: WalletOption[] = Object.values(this.walletsById)
      .filter(w => !w.hidden && !w.rdns.some(rdns => eip6963Rnds.has(rdns)))
      .map(this.createWalletOption);

    const options = wallets.concat(eip6963Wallets).sort(compareWalletOptionForSort);

    // only update if changed
    if (!areWalletOptionsEqual(previousOptions, options)) {
      this.walletOptions = options;
      this.emitOptionsChanged(options);
    }
  }

  /** build a WalletOption from a Wallet */
  protected createWalletOption(wallet: Wallet): WalletOption {
    return {
      id: wallet.id,
      name: wallet.name,
      iconUrl: wallet.iconUrl,
      iconBackground: wallet.iconBackground || '#fff',
      rdns: wallet.rdns,
      ui: wallet.ui,
      type: 'wallet',
      priority: wallet.priority,
    };
  }

  /** build initial wallet options from configured wallets */
  protected buildInitialWalletOptions() {
    const options = Object.values(this.walletsById)
      .filter(w => !w.hidden)
      .map(this.createWalletOption)
      .sort(compareWalletOptionForSort);
    this.walletOptions = options;
    this.emitOptionsChanged(options);
  }

  /**
   * create a connector from a wallet, and register it with wagmi
   **/
  protected registerWalletConnector(wallet: Wallet): Connector {
    console.debug(
      'registerWalletConnector',
      wallet.id,
      Array.from(this.walletToConnector.entries())
    );
    const connector = this.wagmi._internal.connectors.setup(wallet.createConnector);
    this.walletToConnector.set(wallet.id, connector);
    this.connectorIdToWalletId.set(connector.uid, wallet.id);
    this.wagmi._internal.connectors.setState((existing: Connector[]) => [...existing, connector]);
    return connector;
  }

  /**
   * registerWalletConnector for multiple wallets, only generates one state update
   **/
  protected registerConnectorsForWallets(wallets: Wallet[]): void {
    const newConnectors: Connector[] = [];
    for (const wallet of wallets) {
      if (this.walletToConnector.has(wallet.id)) {
        console.warn(`Connector for wallet ${wallet.id} already initialized`);
        continue;
      }
      const connector = this.wagmi._internal.connectors.setup(wallet.createConnector);
      this.walletToConnector.set(wallet.id, connector);
      this.connectorIdToWalletId.set(connector.uid, wallet.id);
      newConnectors.push(connector);
    }
    if (newConnectors.length) {
      this.wagmi._internal.connectors.setState((existing: Connector[]) => [
        ...existing,
        ...newConnectors,
      ]);
    }
  }

  protected getConnectorForWallet(walletId: string): Connector | undefined {
    const connector = this.walletToConnector.get(walletId);
    if (connector) {
      return connector;
    }

    if (walletId.startsWith(eip6963Prefix)) {
      console.debug(`No connector for EIP-6963 wallet with id ${walletId}`);
      return undefined;
    }

    const wallet = this.walletsById[walletId];
    if (!wallet) {
      console.debug(`No wallet with id ${walletId} found`);
      return undefined;
    }

    return this.registerWalletConnector(wallet);
  }

  public dispose() {
    this.unsubscribe();
    this.emitAccountChanged(accountDisconnected);
  }

  /**
   * Attempt to reconnect
   */
  public async reconnect(options: ReconnectOptions = {}) {
    // Skip if already connected
    if (this.wagmi.state.status !== 'disconnected') {
      console.debug('reconnect: not disconnected, skipping');
      return;
    }

    const { walletId, connectorId, autoConnect } = options;
    const availableConnectors = getConnectors(this.wagmi);
    const autoConnectWallets: string[] = [];

    if (autoConnect) {
      for (const wallet of this.walletOptions) {
        if (wallet.rdns.some(rdns => this.autoConnectRdns.has(rdns))) {
          autoConnectWallets.push(wallet.id);
        }
      }
    }

    const autoConnectConnectors = autoConnectWallets
      .map(walletId => this.getConnectorForWallet(walletId))
      .filter(isDefined);

    if (walletId) {
      const connector = this.getConnectorForWallet(walletId);
      if (connector) {
        return await reconnect(this.wagmi, { connectors: [connector, ...autoConnectConnectors] });
      }
      console.debug(`reconnect: no connector for walletId ${walletId}`);
    }

    if (connectorId) {
      const connector = availableConnectors.find(c => c.id === connectorId);
      if (connector) {
        return await reconnect(this.wagmi, { connectors: [connector, ...autoConnectConnectors] });
      }
      console.debug(`reconnect: no connector with id ${connectorId}`);
    }

    if (autoConnectConnectors.length) {
      return await reconnect(this.wagmi, { connectors: autoConnectConnectors });
    }

    console.debug(
      `reconnect: no connectors available for autoConnect`,
      options,
      autoConnectConnectors,
      availableConnectors,
      this.autoConnectRdns,
      autoConnectWallets,
      this.walletOptions.map(w => [w.id, ...w.rdns])
    );
    return undefined;
  }

  public async getConnectedViemClient(forAccount?: Address) {
    const connectionId = this.wagmi.state.current;
    const connection = connectionId ? this.wagmi.state.connections.get(connectionId) : undefined;
    if (!connection || this.wagmi.state.status !== 'connected') {
      throw new Error(`Wallet not connected.`);
    }
    const account = forAccount ?? connection.accounts[0];

    // return same instance if connection and address match
    if (this.lastClient?.account === account && this.lastClient?.connectionId === connectionId) {
      return this.lastClient.client;
    }

    // TODO wrap for tenderly
    const client = withDivvi(
      await getWalletClient(this.wagmi, {
        account,
      })
    );
    this.lastClient = { account, connectionId: connection.connector.uid, client };
    return client;
  }

  public async withProviderWrapper<T>(
    wrapFn: (provider: EIP1193Provider) => EIP1193Provider,
    callback: () => Promise<T>
  ) {
    throw new Error(`Not implemented yet`);
    try {
      this.providerWrapper = wrapFn;
      return await callback();
    } finally {
      this.providerWrapper = undefined;
    }
  }

  protected isConnected() {
    if (this.wagmi.state.status !== 'connected') {
      return false;
    }
    const connection = this.getConnection();
    return !!(connection && connection.accounts.length);
  }

  protected getConnection() {
    const connectionId = this.wagmi.state.current;
    if (!connectionId) {
      return false;
    }
    return this.wagmi.state.connections.get(connectionId);
  }

  /**
   * Attempt to allow user to manually switch networks
   * @param chainId
   */
  public async askUserForChainChange(chainId: ChainEntity['id']) {
    const chain = find(this.chains, chain => chain.id === chainId);
    if (!chain) {
      console.error(`askUserForChainChange: Couldn't find chain by id ${chainId}`);
      throw new Error(`Couldn't find chain by id ${chainId}`);
    }

    if (!this.isConnected()) {
      console.error('askUserForChainChange: Not connected');
      throw new Error(`Wallet must be connected before switching chains`);
    }

    // Change chain
    await switchChain(this.wagmi, {
      chainId: chain.networkChainId,
      addEthereumChainParameter: {
        chainName: chain.name,
        nativeCurrency: {
          name: chain.native.symbol,
          symbol: chain.native.symbol,
          decimals: chain.native.decimals,
        },
        rpcUrls: chain.rpc,
        blockExplorerUrls: [chain.explorerUrl],
      },
    });
  }
}
