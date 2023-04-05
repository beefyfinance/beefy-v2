import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { getWeb3Instance } from '../features/data/apis/instances';
import { ChainEntity } from '../features/data/entities/chain';
import SID, { getSidAddress } from '@siddomains/sidjs';
import unstoppableAbi from '../config/abi/unstoppable.json';
import { AbiItem } from 'web3-utils';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const EEEE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const NATIVE_ADDRESS_ALTERNATIVES = [ZERO_ADDRESS, EEEE_ADDRESS.toLowerCase()];
const UNSTOPPABLE_REGISTRY: Record<ChainEntity['id'], string> = {
  ethereum: '0x049aba7510f45BA5b64ea9E658E342F904DB358D',
  polygon: '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f',
};

export function isZeroAddress(address: string) {
  return address === ZERO_ADDRESS;
}

export function isNativeAlternativeAddress(address: string) {
  return NATIVE_ADDRESS_ALTERNATIVES.includes(address.toLowerCase());
}

export async function getEnsAddress(
  address: string,
  chain: ChainEntity
): Promise<string | undefined> {
  try {
    const web3 = await getWeb3Instance(chain);
    const ensProvider = new Web3Provider(web3.currentProvider as ExternalProvider);
    return await ensProvider.lookupAddress(address);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getUnstoppableAddress(
  address: string,
  chain: ChainEntity
): Promise<string | undefined> {
  if (!(chain.id in UNSTOPPABLE_REGISTRY) || !UNSTOPPABLE_REGISTRY[chain.id]) {
    console.error(`Unstoppable domains are not supported on ${chain.id}`);
    return undefined;
  }

  try {
    const web3 = await getWeb3Instance(chain);
    const contract = new web3.eth.Contract(
      unstoppableAbi as AbiItem[],
      UNSTOPPABLE_REGISTRY[chain.id]
    );
    const result = await contract.methods.reverseNameOf(address).call();
    return result || undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getSpaceIdAddress(
  address: string,
  bscChain: ChainEntity
): Promise<string | undefined> {
  try {
    const web3 = await getWeb3Instance(bscChain);
    const sidProvider = web3.currentProvider;
    const id = new SID({
      provider: sidProvider as unknown as ExternalProvider,
      sidAddress: getSidAddress(`${bscChain.networkChainId}`),
    });
    const sidName = await id.getName(address);
    return sidName.name;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
