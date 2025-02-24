import type { Address } from 'abitype';
import type { ChainId } from '../../entities/chain';
import { rpcClientManager } from './rpc-manager';
import { getContract, type Abi, type WalletClient } from 'viem';

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
  client: WalletClient
) => {
  return getContract({ address: address as Address, abi, client: client });
};
