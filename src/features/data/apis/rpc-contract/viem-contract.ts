import type { Address } from 'viem';
import type { ChainId } from '../../entities/chain.ts';
import { rpcClientManager } from './rpc-manager.ts';
import { type Abi, getContract, type PublicClient, type WalletClient } from 'viem';

export const fetchContract = <TAbi extends Abi>(
  address: string,
  abi: TAbi,
  chainId: ChainId,
  withMulticall: boolean = true
) => {
  const chainClients = rpcClientManager.getClients(chainId);
  const publicClient = withMulticall ? chainClients.batchCallClient : chainClients.singleCallClient;
  return getContract({ address: address as Address, abi, client: publicClient });
};

export const fetchWalletContract = <TAbi extends Abi>(
  address: string,
  abi: TAbi,
  walletClient: WalletClient,
  publicClient?: PublicClient
) => {
  const client =
    publicClient ?
      {
        wallet: walletClient,
        public: publicClient,
      }
    : walletClient;

  return getContract({ address: address as Address, abi, client });
};
