import type { ChainEntity } from '../../entities/chain';
import type { WalletClient } from 'viem';

export interface WalletConnectionOptions {
  chains: ChainEntity[];
  onWalletDisconnected: () => Promise<unknown> | unknown;
  onConnect: (chainId: ChainEntity['id'], address: string) => Promise<unknown> | unknown;
  onAccountChanged: (address: string) => Promise<unknown> | unknown;
  // we also need to pass down the address because sometimes
  // when user change chain we receive a "disconnect" event before the "chainChanged" event
  onChainChanged: (chainId: ChainEntity['id'], address: string) => Promise<unknown> | unknown;
  onUnsupportedChainSelected: (
    networkChainId: number | string,
    address: string
  ) => Promise<unknown> | unknown;
}

export interface IWalletConnectionApi {
  tryToAutoReconnect(): Promise<void>;
  askUserToConnectIfNeeded(): Promise<void>;
  askUserForChainChange(chainId: ChainEntity['id']): Promise<void>;
  disconnect(): Promise<void>;
  getConnectedViemClient(): Promise<WalletClient>;
}
