import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { getWeb3Instance } from '../features/data/apis/instances';
import { ChainEntity } from '../features/data/entities/chain';
import SID, { getSidAddress } from '@siddomains/sidjs';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const EEEE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const NATIVE_ADDRESS_ALTERNATIVES = [ZERO_ADDRESS, EEEE_ADDRESS.toLowerCase()];

export function isZeroAddress(address: string) {
  return address === ZERO_ADDRESS;
}

export function isNativeAlternativeAddress(address: string) {
  return NATIVE_ADDRESS_ALTERNATIVES.includes(address.toLowerCase());
}

export async function getEnsAddress(address: string, chain: ChainEntity): Promise<string> {
  try {
    const web3 = await getWeb3Instance(chain);
    const ensProvider = new Web3Provider(web3.currentProvider as ExternalProvider);
    return await ensProvider.lookupAddress(address);
  } catch (error) {
    return '';
  }
}

export async function getSpaceIdAddress(address: string, bscChain: ChainEntity): Promise<string> {
  const web3 = await getWeb3Instance(bscChain);
  const sidProvider = web3.currentProvider;
  try {
    const id = new SID({
      provider: sidProvider,
      sidAddress: getSidAddress(`${bscChain.networkChainId}`),
    });
    const sidName = await id.getName(address);
    return sidName.name;
  } catch (error) {
    return '';
  }
}
