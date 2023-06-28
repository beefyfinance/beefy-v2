import { Web3Provider } from '@ethersproject/providers';
import type { ExternalProvider, Provider } from '@ethersproject/providers';
import { getWeb3Instance } from '../features/data/apis/instances';
import type { ChainEntity } from '../features/data/entities/chain';
import { lookupAddress, lookupDomain } from 'ens-reverse';
import Web3 from 'web3';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const EEEE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const NATIVE_ADDRESS_ALTERNATIVES = [ZERO_ADDRESS, EEEE_ADDRESS.toLowerCase()];

export function isNativeAlternativeAddress(address: string) {
  return NATIVE_ADDRESS_ALTERNATIVES.includes(address.toLowerCase());
}

export async function getAddressDomains(
  address: string,
  chains: ChainEntity[]
): Promise<string[] | undefined> {
  const providers: Record<number, Provider> = (
    await Promise.all(chains.map(chain => getWeb3Instance(chain)))
  ).reduce((acc: Record<number, Provider>, web3, index) => {
    acc[chains[index].networkChainId] = new Web3Provider(web3.currentProvider as ExternalProvider);
    return acc;
  }, {});

  return await lookupAddress(address, providers);
}

export async function getDomainAddress(
  address: string,
  chains: ChainEntity[]
): Promise<string | undefined> {
  const providers: Record<number, Provider> = (
    await Promise.all(chains.map(chain => getWeb3Instance(chain)))
  ).reduce((acc: Record<number, Provider>, web3, index) => {
    acc[chains[index].networkChainId] = new Web3Provider(web3.currentProvider as ExternalProvider);
    return acc;
  }, {});

  return await lookupDomain(address, providers);
}

const DEFAULT_VALID_TLDS: string[] = [
  'eth', // ENS
  'crypto', // https://api.unstoppabledomains.com/resolve/supported_tlds
  'bitcoin',
  'blockchain',
  'dao',
  'nft',
  '888',
  'wallet',
  'x',
  'klever',
  'zil',
  'hi',
  'kresus',
  'polygon',
  'anime',
  'manga',
  'binanceus',
  'bnb', // https://space.id/
  'arb',
];

/**
 * Check if a string is likely a valid domain name, not exhaustive
 */
export function isMaybeDomain(domain: string, validTlds = DEFAULT_VALID_TLDS, minNameLength = 3) {
  const minTldLength = Math.min(...validTlds.map(tld => tld.length));
  const minTotalLength = minNameLength + 1 + minTldLength;

  if (domain.length < minTotalLength) {
    return false;
  }

  const dot = domain.lastIndexOf('.');
  if (dot < minNameLength || dot === domain.length - 1) {
    return undefined;
  }

  const tld = domain.substring(dot + 1);
  if (tld.length < minTldLength) {
    return false;
  }

  return validTlds.includes(tld.toLowerCase());
}

export function isValidAddress(address: string) {
  return address.startsWith('0x') && address.length === 42 && Web3.utils.isAddress(address);
}
