import type { ChainEntity } from '../entities/chain.ts';
import { getGasPricer } from '../apis/instances.ts';

export async function getGasPriceOptions(chain: ChainEntity) {
  const api = await getGasPricer(chain);
  const result = await api.getGasPrice();
  return result;
}
