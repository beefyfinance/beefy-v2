import type { WalletOption } from '../../apis/wallet/wallet-connection-types.ts';
import type { Address } from 'viem';
import type { Connector } from '@wagmi/core';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ChainId } from '../../apis/chains/entity-types.ts';

export type AccountConnected = {
  address: Address;
  addresses: readonly [Address, ...Address[]];
  chainId: ChainId | undefined;
  networkChainId: number;
  connector: Connector;
  isConnected: true;
  isConnecting: false;
  isDisconnected: false;
  isReconnecting: false;
  status: 'connected';
};

export type AccountReconnecting = {
  address: Address | undefined;
  addresses: readonly Address[] | undefined;
  chainId: ChainId | undefined;
  networkChainId: number | undefined;
  connector: Connector | undefined;
  isConnected: boolean;
  isConnecting: false;
  isDisconnected: false;
  isReconnecting: true;
  status: 'reconnecting';
};

export type AccountConnecting = {
  address: Address | undefined;
  addresses: readonly Address[] | undefined;
  chainId: ChainId | undefined;
  networkChainId: number | undefined;
  connector: Connector | undefined;
  isConnected: false;
  isReconnecting: false;
  isConnecting: true;
  isDisconnected: false;
  status: 'connecting';
};

export type AccountDisconnected = {
  address: undefined;
  addresses: undefined;
  chainId: undefined;
  networkChainId: undefined;
  connector: undefined;
  isConnected: false;
  isReconnecting: false;
  isConnecting: false;
  isDisconnected: true;
  status: 'disconnected';
};

export type WalletAccount =
  | AccountConnected
  | AccountReconnecting
  | AccountConnecting
  | AccountDisconnected;

type WalletRecent = {
  address: Address | undefined;
  chainId: ChainId | undefined;
  walletId: string | undefined;
  connectorId: string | undefined;
};

export type SelectClosed = {
  open: false;
};

export type SelectWallet = {
  open: true;
  step: 'wallet';
};

export type SelectConnecting = {
  open: true;
  step: 'connecting';
  requestId: string;
  wallet: WalletOption;
  qr?: string;
};

export type SelectError = {
  open: true;
  step: 'error';
  requestId: string;
  wallet: WalletOption;
  error: SerializedError;
};

export type WalletSelect = SelectClosed | SelectWallet | SelectConnecting | SelectError;

/**
 * Only address and hideBalance are persisted
 */
export type WalletState = {
  /** current wallet address (does not necessarily mean wallet is connected) */
  address: string | undefined;
  /** current wallet account/connection info/status */
  account: WalletAccount;
  /** most recently used wallet info */
  recent: WalletRecent;
  /** select wallet ui state */
  select: WalletSelect;
  /** available wallets */
  options: WalletOption[];
  /** user settings */
  settings: {
    hideBalance: boolean;
  };
  isInMiniApp: boolean;
};
