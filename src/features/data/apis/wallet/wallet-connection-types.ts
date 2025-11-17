import type { Address, EIP1193Provider, WalletClient } from 'viem';
import type { Connection, ReconnectReturnType, Register } from '@wagmi/core';
import type { WalletsConfig } from './wallets.ts';
import type { WalletAccount } from '../../reducers/wallet/wallet-types.ts';
import type { LazyValue } from './helpers.ts';
import type { Wallet } from './wallet-types.ts';
import type { ChainEntity, ChainId } from '../chains/entity-types.ts';

export type ConnectionStatus = Register['config']['state']['status'];

export type ConnectedState = {
  status: 'connected';
  connectionId: string;
  connection: Connection;
  chainId: number;
  accounts: readonly [Address, ...Address[]];
};

export type UnconnectedState = {
  status: Exclude<ConnectionStatus, 'connected'>;
};

export type ConnectionState = ConnectedState | UnconnectedState;

type ConnectBase = {
  requestId: string;
  wallet: WalletOption;
  chainId?: ChainId;
};

export type ConnectConnecting = ConnectBase & {
  status: 'pending';
};

export type ConnectDisplayQR = ConnectBase & {
  status: 'qr';
  uri: string;
};

export type ConnectSuccess = ConnectBase & {
  status: 'success';
};

export type ConnectCancelled = ConnectBase & {
  status: 'cancelled';
};

export type ConnectError = ConnectBase & {
  status: 'error';
  error: unknown;
};

export type WalletEvents = {
  onAccountChange: (account: WalletAccount) => void;
  onOptionsChange: (wallets: WalletOption[]) => void;
  onConnectConnecting: (data: ConnectConnecting) => void;
  onConnectDisplayQr: (data: ConnectDisplayQR) => void;
  onConnectSuccess: (data: ConnectSuccess) => void;
  onConnectCancelled: (data: ConnectCancelled) => void;
  onConnectError: (data: ConnectError) => void;
};

export type WalletConnectionInitOptions = {
  chains: ChainEntity[];
  wagmi: Register['config'];
  events: WalletEvents;
  wallets: WalletsConfig;
};

export type WalletConnectionOptions = {
  chains: readonly ChainEntity[];
  wagmi: Register['config'];
  events: WalletEvents;
  wallets: readonly Wallet[];
  initialWalletIds: readonly string[];
} & Omit<WalletsConfig, 'initial' | 'lazy'>;

export type WalletIdentifier = {
  id: string;
  type: 'wallet' | 'eip6963';
};

export type WalletOption = {
  id: string;
  type: string;
  name: string;
  iconUrl: LazyValue<string>;
  iconBackground: string;
  rdns: readonly string[];
  ui: 'embed' | 'external' | 'qr';
  priority: number;
};

export type ConnectOptions = {
  requestId: string;
  walletId: string;
  chainId?: ChainEntity['id'];
};

export type ReconnectOptions = {
  walletId?: string;
  connectorId?: string;
  /** auto connect via configured auto connect connectors if cannot connect via provided walletId/connectorId */
  autoConnect?: boolean;
};

export interface IWalletConnectionApi {
  connect(options: ConnectOptions): Promise<boolean>;
  cancelConnect(): void;
  reconnect(options?: ReconnectOptions): Promise<ReconnectReturnType | undefined>;
  askUserForChainChange(chainId: ChainEntity['id']): Promise<void>;
  getConnectedViemClient(): Promise<WalletClient>;
  disconnect(): Promise<void>;

  withProviderWrapper<T>(
    wrapFn: (provider: EIP1193Provider) => EIP1193Provider,
    callback: () => Promise<T>
  ): Promise<T>;

  dispose(): void;
}
