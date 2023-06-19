import { Web3Provider } from '@ethersproject/providers';
import type { ExternalProvider, Provider } from '@ethersproject/providers';
import { getWeb3Instance } from '../features/data/apis/instances';
import type { ChainEntity } from '../features/data/entities/chain';
import { lookupAddress } from 'ens-reverse';
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

export async function getEnsResolver(ens: string, chain: ChainEntity): Promise<string | null> {
  const web3Instance = await getWeb3Instance(chain);
  const provider = new Web3Provider(web3Instance.currentProvider as ExternalProvider);
  const address = await provider.resolveName(ens);
  return address;
}

export function isValidEns(ens: string) {
  //min lenght for ens is 3 chars + 4 by default (.eth)
  return ens.length >= 7 && ens.includes('.eth');
}

export function isValidAddress(address: string) {
  return address.startsWith('0x') && Web3.utils.isAddress(address);
}
