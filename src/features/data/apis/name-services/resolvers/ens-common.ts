import { type Abi, type Address, type Hash } from 'viem';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { ChainId } from '../../../entities/chain.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { ResolverMethods } from '../types.ts';
import { hashDomain, normalizeAddress, normalizeAndHashDomain } from '../utils.ts';

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

type ChainParams = {
  registryAddress: Address;
  /** ENSIP-19 */
  reverseDomain?: string;
};

type MakeEnsResolverParams<TChain extends ChainId> = Record<TChain, ChainParams>;

export function makeEnsResolver<TChain extends ChainId>(
  _chains: MakeEnsResolverParams<TChain>
): ResolverMethods {
  const chains: Partial<MakeEnsResolverParams<ChainId>> = _chains;

  function getReverseDomain(chainId: ChainId): string {
    return chains[chainId]?.reverseDomain || 'addr.reverse';
  }

  function getRegistryAddress(chainId: ChainId): Address | undefined {
    return chains[chainId]?.registryAddress || undefined;
  }

  async function fetchResolverAddress(hash: Hash, chainId: ChainId): Promise<Address | undefined> {
    const registryAddress = getRegistryAddress(chainId);
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
   * @dev does not validate that the domain resolves back to the address
   */
  async function addressToDomain(address: Address, chainId: ChainId): Promise<string | undefined> {
    const rootReverseDomain = getReverseDomain(chainId);
    const reverseDomain = `${address.slice(2).toLowerCase()}.${rootReverseDomain}`;
    const reverseHash = hashDomain(reverseDomain);

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

  return {
    domainToAddress,
    addressToDomain,
  };
}
