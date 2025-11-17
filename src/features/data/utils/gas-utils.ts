import { getGasPricer } from '../apis/instances.ts';
import type { ChainEntity } from '../apis/chains/entity-types.ts';

export async function getGasPriceOptions(chain: ChainEntity) {
  const api = await getGasPricer(chain);
  const result = await api.getGasPrice();
  return result;
}
