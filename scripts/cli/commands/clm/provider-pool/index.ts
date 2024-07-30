import { ProviderPool, ProviderPoolConfig } from './types';
import { Address } from 'viem';
import { AddressBookChainId } from '../../../../common/config';

async function importConfig(providerId: string) {
  try {
    const module = await import(`./${providerId}`);
    return module.default as ProviderPoolConfig;
  } catch (e) {
    throw new Error(`Provider pool config not found for ${providerId}`, { cause: e });
  }
}

export async function getProviderPool(
  chainId: AddressBookChainId,
  poolAddress: Address,
  providerId: string
): Promise<ProviderPool> {
  const config = await importConfig(providerId);

  const feeTier =
    typeof config.feeTier === 'function'
      ? await config.feeTier(chainId, poolAddress)
      : config.feeTier;

  return {
    ...config,
    address: poolAddress,
    feeTier,
  };
}
