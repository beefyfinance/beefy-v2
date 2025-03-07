import type { ChainId } from '../../../../entities/chain.ts';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses.ts';
import {
  hashDomain,
  normalizeAddress,
  normalizeAndHashDomain,
  normalizeDomain,
} from '../../utils.ts';
import type { Abi, Address, Hash } from 'viem';
import type { AllChainsFromTldToChain } from '../../types.ts';
import type { tldToChain } from './tlds.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';

const registryAddresses: Partial<Record<ChainId, Address>> = {
  // ethereum: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  bsc: '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956',
  gnosis: '0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17',
  // manta: '0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17',
  mode: '0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17',
  arbitrum: '0x4a067EE58e73ac5E4a43722E008DFdf65B2bF348',
} satisfies Record<AllChainsFromTldToChain<typeof tldToChain>, Address>;

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

const reverseResolverAbi = [
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

async function fetchResolverAddress(hash: Hash, chainId: ChainId): Promise<Address | undefined> {
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    return undefined;
  }

  const contract = fetchContract(registryAddress, registryAbi, chainId);
  try {
    const resolved = await contract.read.resolver([hash]);
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
    const resolved = await resolverContract.read.addr([hash]);
    return normalizeAddress(resolved);
  } catch {
    return undefined;
  }
}

/**
 * Lookup the (first) domain name for an address
 */
export async function addressToDomain(
  address: Address,
  chainId: ChainId
): Promise<string | undefined> {
  const reverseDomain = `${normalizeDomain(address.slice(2))}.addr.reverse`;
  const reverseHash = hashDomain(reverseDomain);
  if (!reverseHash) {
    return undefined;
  }

  const resolverAddress = await fetchResolverAddress(reverseHash, chainId);
  if (!resolverAddress || resolverAddress === ZERO_ADDRESS) {
    return undefined;
  }

  const resolverContract = fetchContract(resolverAddress, reverseResolverAbi, chainId);
  try {
    const domain: string = await resolverContract.read.name([reverseHash]);
    return domain || undefined;
  } catch {
    return undefined;
  }
}
