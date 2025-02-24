import type { ChainId } from '../../../../entities/chain';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses';
import { normalizeAddress, normalizeAndHashDomain } from '../../utils';
import type { Abi, Address } from 'viem';
import type { AllChainsFromTldToChain } from '../../types';
import type { tldToChain } from './tlds';
import { fetchContract } from '../../../rpc-contract/viem-contract';

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
] as const satisfies Abi;

const resolverAbi = [
  {
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

const reverseRecordsAbi = [
  {
    inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    name: 'getNames',
    outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

async function fetchResolverAddress(hash: string, chainId: ChainId): Promise<Address | undefined> {
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    return undefined;
  }

  const contract = fetchContract(registryAddress, registryAbi, chainId);
  try {
    const resolved = await contract.read.resolver([hash as Address]);
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
  chainId: ChainId
): Promise<Address | undefined> {
  const hash = normalizeAndHashDomain(domain);
  if (!hash) {
    return undefined;
  }

  const resolverAddress = await fetchResolverAddress(hash, chainId);
  if (!resolverAddress || resolverAddress === ZERO_ADDRESS) {
    return undefined;
  }

  const resolverContract = fetchContract(resolverAddress, resolverAbi, chainId);
  try {
    const resolved = await resolverContract.read.addr([hash as Address]);
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
  chainId: ChainId
): Promise<string | undefined> {
  const reverseRecordsAddress = reverseRecordsAddresses[chainId];
  if (!reverseRecordsAddress) {
    return undefined;
  }

  const contract = fetchContract(reverseRecordsAddress, reverseRecordsAbi, chainId);
  try {
    const domains = await contract.read.getNames([[address as Address]]);
    return domains?.[0] || undefined;
  } catch {
    return undefined;
  }
}
