import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectClmPnlMerklRewards } from './analytics.ts';

const WALLET = '0xabc';
const ids = {
  clm: 'clm',
  pool: 'clm-rp',
  vault: 'clm-vault',
  pools: ['clm-rp'],
  vaults: ['clm-vault'],
};
const reward = (symbol: string, accumulated: number) => ({
  token: { symbol, address: `0x${symbol}`, chainId: 'base', decimals: 18 },
  campaignIds: [symbol],
  accumulated: new BigNumber(accumulated),
  unclaimed: new BigNumber(accumulated),
});

function state(
  byVaultId: Record<string, unknown[]>,
  held: string[] = ['clm-rp', 'clm-vault']
): BeefyState {
  return {
    entities: {
      vaults: {
        byId: {
          clm: { id: 'clm', type: 'cowcentrated', cowcentratedIds: ids },
          'clm-rp': { id: 'clm-rp', type: 'gov', subType: 'cowcentrated', cowcentratedIds: ids },
          'clm-vault': {
            id: 'clm-vault',
            type: 'standard',
            subType: 'cowcentrated',
            cowcentratedIds: ids,
          },
        },
      },
    },
    user: {
      balance: { byAddress: { [WALLET]: { depositedVaultIds: held } } },
      rewards: { byUser: { [WALLET]: { byProvider: { merkl: { byVaultId } } } } },
    },
  } as unknown as BeefyState;
}

const symbols = (rewards: ReturnType<typeof selectClmPnlMerklRewards>) =>
  (rewards ?? []).map(r => r.token.symbol);

describe('selectClmPnlMerklRewards', () => {
  const s = state({
    clm: [reward('CLM', 5)],
    'clm-rp': [reward('POOL', 3)],
    'clm-vault': [reward('VAULT', 2)],
  });

  it('credits CLM-level rewards to the pool side, as prod did', () => {
    expect(symbols(selectClmPnlMerklRewards(s, 'clm-rp', WALLET))).toEqual(['POOL', 'CLM']);
  });

  it('keeps the vault side to its own rewards, so no reward counts twice across sides', () => {
    expect(symbols(selectClmPnlMerklRewards(s, 'clm-vault', WALLET))).toEqual(['VAULT']);
  });

  it('moves CLM-level rewards to the vault side when the pool side is not held', () => {
    const vaultOnly = state({ clm: [reward('CLM', 5)], 'clm-vault': [reward('VAULT', 2)] }, [
      'clm-vault',
    ]);
    expect(symbols(selectClmPnlMerklRewards(vaultOnly, 'clm-vault', WALLET))).toEqual([
      'VAULT',
      'CLM',
    ]);
    expect(symbols(selectClmPnlMerklRewards(vaultOnly, 'clm-rp', WALLET))).toEqual([]);
  });

  it('sums campaigns paying the same token into one row', () => {
    const sameToken = state({ clm: [reward('USDC', 12)], 'clm-rp': [reward('USDC', 5)] });
    const rewards = selectClmPnlMerklRewards(sameToken, 'clm-rp', WALLET) ?? [];
    expect(rewards).toHaveLength(1);
    expect(rewards[0].unclaimed.toString()).toEqual('17');
  });

  it('still credits CLM-level rewards to a pool with none of its own', () => {
    expect(
      symbols(selectClmPnlMerklRewards(state({ clm: [reward('CLM', 5)] }), 'clm-rp', WALLET))
    ).toEqual(['CLM']);
  });
});
