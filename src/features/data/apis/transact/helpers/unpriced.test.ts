import { describe, expect, it } from 'vitest';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { WithdrawOption } from '../transact-types.ts';
import { filterUnpricedSwapOptions } from './unpriced.ts';

const state = {
  entities: {
    chains: {
      byId: {
        base: { id: 'base', features: { price: true, apy: true } },
        fantom: { id: 'fantom', features: { price: false, apy: false } },
      },
    },
  },
} as unknown as BeefyState;

const vaultOption = { id: 'vault', strategyId: 'vault' };
const breakLp = { id: 'break', strategyId: 'uniswap-v2' };
const poolSwap = { id: 'pool', strategyId: 'solidly', swapVia: 'pool' };
const aggregatorSwap = { id: 'agg', strategyId: 'uniswap-v2', swapVia: 'aggregator' };
const clmSplit = {
  id: 'split',
  strategyId: 'gov-composer',
  underlyingOption: { strategyId: 'vault' },
};
const clmSwap = {
  id: 'clm-swap',
  strategyId: 'gov-composer',
  underlyingOption: { strategyId: 'cowcentrated' },
};
const curveDirect = { id: 'curve', strategyId: 'curve', via: 'direct' };
const rewardPoolToVault = { id: 'rp', strategyId: 'reward-pool-to-vault' };

const options = [
  vaultOption,
  breakLp,
  poolSwap,
  aggregatorSwap,
  clmSplit,
  clmSwap,
  curveDirect,
  rewardPoolToVault,
] as unknown as WithdrawOption[];

const ids = (list: WithdrawOption[]) => list.map(option => option.id);

describe('filterUnpricedSwapOptions', () => {
  it('keeps every option on a chain with prices', () => {
    const vault = { chainId: 'base' } as VaultEntity;
    expect(filterUnpricedSwapOptions(state, vault, options)).toBe(options);
  });

  it('keeps only direct vault options and LP breaks on a chain without prices', () => {
    const vault = { chainId: 'fantom' } as VaultEntity;
    expect(ids(filterUnpricedSwapOptions(state, vault, options))).toStrictEqual([
      'vault',
      'break',
      'split',
    ]);
  });
});
