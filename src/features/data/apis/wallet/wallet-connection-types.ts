import type { ChainEntity } from '../../entities/chain.ts';
import type { WalletClient } from 'viem';

export interface WalletConnectionOptions {
  chains: ChainEntity[];
  onWalletDisconnected: () => void;
  onConnect: (chainId: ChainEntity['id'], address: string) => void;
  onAccountChanged: (address: string) => void;
  // we also need to pass down the address because sometimes
  // when user change chain we receive a "disconnect" event before the "chainChanged" event
  onChainChanged: (chainId: ChainEntity['id'], address: string) => void;
  onUnsupportedChainSelected: (networkChainId: number | string, address: string) => void;
}

export interface IWalletConnectionApi {
  tryToAutoReconnect(): Promise<void>;
  askUserToConnectIfNeeded(): Promise<void>;
  askUserForChainChange(chainId: ChainEntity['id']): Promise<void>;
  disconnect(): Promise<void>;
  getConnectedViemClient(): Promise<WalletClient>;
}
