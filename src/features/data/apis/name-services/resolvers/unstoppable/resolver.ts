import type { ChainId } from '../../../../entities/chain.ts';
import { normalizeAddress, normalizeAndHashDomain } from '../../utils.ts';
import { hexToBigInt, type Abi, type Address } from 'viem';
import type { AllChainsFromTldToChain } from '../../types.ts';
import type { tldToChain } from './tlds.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';

// https://docs.unstoppabledomains.com/smart-contracts/contract-reference/uns-smart-contracts/#unsregistry
// https://github.com/unstoppabledomains/uns/blob/main/Contracts.md
// Entry must exist for each chain present in tldToChain
const registryAddresses: Partial<Record<ChainId, Address>> = {
  ethereum: '0x049aba7510f45BA5b64ea9E658E342F904DB358D',
  polygon: '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f',
} satisfies Record<AllChainsFromTldToChain<typeof tldToChain>, Address>;

// https://docs.unstoppabledomains.com/smart-contracts/contract-reference/uns-smart-contracts/#proxyreader
// https://github.com/unstoppabledomains/uns/blob/main/Contracts.md
// Entry must exist for each chain present in tldToChain
const proxyReaderAddresses: Partial<Record<ChainId, Address>> = {
  ethereum: '0x58034A288D2E56B661c9056A0C27273E5460B63c',
  polygon: '0x423F2531bd5d3C3D4EF7C318c2D1d9BEDE67c680',
} satisfies Record<AllChainsFromTldToChain<typeof tldToChain>, Address>;

const registryAbi = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'reverseNameOf',
    outputs: [{ internalType: 'string', name: 'reverseUri', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

const proxyReaderAbi = [
  {
    inputs: [
      { internalType: 'string[]', name: 'keys', type: 'string[]' },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getMany',
    outputs: [{ internalType: 'string[]', name: 'values', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

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

  const proxyReaderAddress = proxyReaderAddresses[chainId];
  if (!proxyReaderAddress) {
    return undefined;
  }

  const proxyReaderContract = fetchContract(proxyReaderAddress, proxyReaderAbi, chainId);
  try {
    const data = await proxyReaderContract.read.getMany([
      ['crypto.ETH.address'],
      hexToBigInt(hash),
    ]);
    return normalizeAddress(data?.[0]);
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
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    return undefined;
  }

  const contract = fetchContract(registryAddress, registryAbi, chainId);
  try {
    const domain: string = await contract.read.reverseNameOf([address]);
    return domain || undefined;
  } catch {
    return undefined;
  }
}
