import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { ChainId } from '../../../../entities/chain';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses';
import { normalizeAddress, normalizeAndHashDomain } from '../../utils';
import type { Address } from 'viem';
import type { AllChainsFromTldToChain } from '../../types';
import type { tldToChain } from './tlds';

const registryAddresses: Record<AllChainsFromTldToChain<typeof tldToChain>, Address> = {
  ethereum: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

const reverseRecordsAddresses: Record<AllChainsFromTldToChain<typeof tldToChain>, Address> = {
  ethereum: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
};

const registryAbi = [
  {
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'resolver',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] satisfies AbiItem[];

const resolverAbi = [
  {
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] satisfies AbiItem[];

const reverseRecordsAbi = [
  {
    inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    name: 'getNames',
    outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] satisfies AbiItem[];

async function fetchResolverAddress(
  hash: string,
  chainId: ChainId,
  web3: Web3
): Promise<Address | undefined> {
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    return undefined;
  }

  const contract = new web3.eth.Contract(registryAbi, registryAddress);
  try {
    const resolved = await contract.methods.resolver(hash).call();
    return normalizeAddress(resolved);
  } catch {
    return undefined;
  }
}

/**
 * Lookup the (first) address for a domain name
 */
export async function domainToAddress(
  domain: string,
  chainId: ChainId,
  web3: Web3
): Promise<Address | undefined> {
  const hash = normalizeAndHashDomain(domain);
  if (!hash) {
    return undefined;
  }

  const resolverAddress = await fetchResolverAddress(hash, chainId, web3);
  if (!resolverAddress || resolverAddress === ZERO_ADDRESS) {
    return undefined;
  }

  const resolverContract = new web3.eth.Contract(resolverAbi, resolverAddress);
  try {
    const resolved = await resolverContract.methods.addr(hash).call();
    return normalizeAddress(resolved);
  } catch {
    return undefined;
  }
}

/**
 * Lookup the (first) domain name for an address
 */
export async function addressToDomain(
  address: string,
  chainId: ChainId,
  web3: Web3
): Promise<string | undefined> {
  const reverseRecordsAddress = reverseRecordsAddresses[chainId];
  if (!reverseRecordsAddress) {
    return undefined;
  }

  const contract = new web3.eth.Contract(reverseRecordsAbi, reverseRecordsAddress);
  try {
    const domains = await contract.methods.getNames([address]).call();
    return domains?.[0] || undefined;
  } catch {
    return undefined;
  }
}
