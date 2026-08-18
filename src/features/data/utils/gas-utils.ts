import type { ChainEntity } from '../entities/chain.ts';
import { getGasPricer } from '../apis/instances.ts';

type GasLimitType = 'approval' | 'other';

// wallet-side gas estimation is unreliable on base for b20 tokens, we can remove once fixed
const GAS_LIMIT_OVERRIDES: Partial<Record<ChainEntity['id'], Record<GasLimitType, bigint>>> = {
  base: {
    approval: 1_000_000n,
    other: 9_000_000n,
  },
};

export async function getGasPriceOptions(chain: ChainEntity, limitType: GasLimitType = 'other') {
  const api = await getGasPricer(chain);
  const result = await api.getGasPrice();
  const gas = GAS_LIMIT_OVERRIDES[chain.id]?.[limitType];
  return gas ? { ...result, gas } : result;
}
