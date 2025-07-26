import type { Abi, Address, Hash } from 'viem';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { ChainId } from '../../../entities/chain.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { ResolverMethods } from '../types.ts';
import { normalizeAddress, normalizeAndHashDomain } from '../utils.ts';

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

export function makeEnsResolver<TChain extends ChainId>(
  registryAddresses: Record<TChain, Address>,
  reverseRecordsAddresses: Record<TChain, Address>
): ResolverMethods {
  const _registryAddresses: Partial<Record<ChainId, Address>> = registryAddresses;
  const _reverseRecordsAddresses: Partial<Record<ChainId, Address>> = reverseRecordsAddresses;

  async function fetchResolverAddress(hash: Hash, chainId: ChainId): Promise<Address | undefined> {
    const registryAddress = _registryAddresses[chainId];
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
  async function domainToAddress(domain: string, chainId: ChainId): Promise<Address | undefined> {
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
  async function addressToDomain(address: Address, chainId: ChainId): Promise<string | undefined> {
    const reverseRecordsAddress = _reverseRecordsAddresses[chainId];
    if (!reverseRecordsAddress) {
      return undefined;
    }

    const contract = fetchContract(reverseRecordsAddress, reverseRecordsAbi, chainId);
    try {
      const domains = await contract.read.getNames([[address]]);
      return domains?.[0] || undefined;
    } catch {
      return undefined;
    }
  }

  return {
    domainToAddress,
    addressToDomain,
  };
}
