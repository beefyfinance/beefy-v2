import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { ChainId } from '../../../../entities/chain';
import { normalizeAddress, normalizeAndHashDomain } from '../../utils';
import type { Address } from 'viem';
import type { AllChainsFromTldToChain } from '../../types';
import type { tldToChain } from './tlds';

// https://docs.unstoppabledomains.com/smart-contracts/contract-reference/uns-smart-contracts/#unsregistry
// https://github.com/unstoppabledomains/uns/blob/main/Contracts.md
// Entry must exist for each chain present in tldToChain
const registryAddresses: Record<AllChainsFromTldToChain<typeof tldToChain>, Address> = {
  ethereum: '0x049aba7510f45BA5b64ea9E658E342F904DB358D',
  polygon: '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f',
};

// https://docs.unstoppabledomains.com/smart-contracts/contract-reference/uns-smart-contracts/#proxyreader
// https://github.com/unstoppabledomains/uns/blob/main/Contracts.md
// Entry must exist for each chain present in tldToChain
const proxyReaderAddresses: Record<AllChainsFromTldToChain<typeof tldToChain>, Address> = {
  ethereum: '0x58034A288D2E56B661c9056A0C27273E5460B63c',
  polygon: '0x423F2531bd5d3C3D4EF7C318c2D1d9BEDE67c680',
};

const registryAbi = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'reverseNameOf',
    outputs: [{ internalType: 'string', name: 'reverseUri', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] satisfies AbiItem[];

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
] satisfies AbiItem[];

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

  const proxyReaderAddress = proxyReaderAddresses[chainId];
  if (!proxyReaderAddress) {
    return undefined;
  }

  const proxyReaderContract = new web3.eth.Contract(proxyReaderAbi, proxyReaderAddress);
  try {
    const data = await proxyReaderContract.methods.getMany(['crypto.ETH.address'], hash).call();
    return normalizeAddress(data?.[0]);
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
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    return undefined;
  }

  const contract = new web3.eth.Contract(registryAbi, registryAddress);
  try {
    const domain = await contract.methods.reverseNameOf(address).call();
    return domain || undefined;
  } catch {
    return undefined;
  }
}
