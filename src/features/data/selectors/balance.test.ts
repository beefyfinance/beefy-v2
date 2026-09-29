import { describe, expect, it } from 'vitest';
import { fetchBalanceAction } from '../actions/balance.ts';
import {
  arcUsdc,
  baseNative,
  bn,
  makeState,
} from '../apis/transact/helpers/same-balance.test-helper.ts';
import type { TokenEntity } from '../entities/token.ts';
import { balanceSlice, initialBalanceState } from '../reducers/wallet/balance.ts';
import type { BeefyState } from '../store/types.ts';
import { selectSpendsWholeSharedBalance } from './balance.ts';

const WALLET = '0xa55e75c4815ff39efd76c257857441d9fd99b45b';

function stateHolding(token: TokenEntity, amount: string): BeefyState {
  const balance = balanceSlice.reducer(
    initialBalanceState,
    fetchBalanceAction.fulfilled(
      {
        chainId: token.chainId,
        walletAddress: WALLET,
        data: {
          tokens: [{ tokenAddress: token.address, amount: bn(amount) }],
          govVaults: [],
          boosts: [],
          erc4626Pending: [],
        },
        state: makeState(),
      },
      'req',
      { chainId: token.chainId }
    )
  );
  return makeState({ user: { balance } });
}

describe('selectSpendsWholeSharedBalance', () => {
  const state = stateHolding(arcUsdc, '10');

  it('is true for the whole balance, which is also the gas', () => {
    expect(selectSpendsWholeSharedBalance(state, 'arc', bn('10'), WALLET)).toBe(true);
  });

  it('is true for more than the balance', () => {
    expect(selectSpendsWholeSharedBalance(state, 'arc', bn('11'), WALLET)).toBe(true);
  });

  it('is false while any of it is left for gas', () => {
    expect(selectSpendsWholeSharedBalance(state, 'arc', bn('9.999999'), WALLET)).toBe(false);
  });

  it('is false where native and wnative are separate balances', () => {
    const base = stateHolding(baseNative, '10');
    expect(selectSpendsWholeSharedBalance(base, 'base', bn('10'), WALLET)).toBe(false);
  });

  it('is false while the balance is unknown', () => {
    const empty = makeState({ user: { balance: initialBalanceState } });
    expect(selectSpendsWholeSharedBalance(empty, 'arc', bn('10'), WALLET)).toBe(false);
  });
});
