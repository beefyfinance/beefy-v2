import { ChainEntity } from '../entities/chain';
import { getGasPricer } from '../apis/instances';

export async function getGasPriceOptions(chain: ChainEntity) {
  const api = await getGasPricer(chain);
  const result = await api.getGasPrice();
  console.debug(chain.id, result);
  return result;
}
