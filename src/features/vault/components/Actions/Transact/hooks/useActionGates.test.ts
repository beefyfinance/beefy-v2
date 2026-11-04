import type BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import type { InputTokenAmount } from '../../../../../data/apis/transact/transact-types.ts';
import {
  arcNative,
  arcUsdc,
  baseNative,
  baseUsdc,
  bn,
  makeState,
} from '../../../../../data/apis/transact/helpers/same-balance.test-helper.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { initialBalanceState, balanceSlice } from '../../../../../data/reducers/wallet/balance.ts';
import { fetchBalanceAction } from '../../../../../data/actions/balance.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';
import { spendsAllGas } from './useActionGates.ts';

// the override reads window.location, which this environment has not got
vi.mock(import('../../../../../data/utils/feature-flags.ts'), async importOriginal => ({
  ...(await importOriginal()),
  featureFlag_walletAddressOverride: (address: string) => address,
}));

const WALLET = '0xa55e75c4815ff39efd76c257857441d9fd99b45b';

/** balances are stored per address, so they have to go in through the reducer */
function stateWithBalances(held: Array<[TokenEntity, string]>): BeefyState {
  const balance = held.reduce(
    (state, [token, amount]) =>
      balanceSlice.reducer(
        state,
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
      ),
    initialBalanceState
  );

  return makeState({ user: { balance, wallet: { address: WALLET } } });
}

const state = stateWithBalances([
  [arcUsdc, '10'],
  [baseNative, '10'],
  [baseUsdc, '10'],
]);

const input = (token: TokenEntity, amount: BigNumber, max = false): InputTokenAmount => ({
  token,
  amount,
  max,
});

describe('spendsAllGas where balanceSharedWithWrapped', () => {
  it.each([
    ['the erc20 view', arcUsdc],
    ['native', arcNative],
  ])('catches the whole balance typed by hand as %s', (_case, token) => {
    expect(spendsAllGas(state, input(token, bn('10')))).toBe(true);
    expect(spendsAllGas(state, input(token, bn('10.5')))).toBe(true);
  });

  it('leaves a smaller amount alone', () => {
    expect(spendsAllGas(state, input(arcUsdc, bn('9.999999')))).toBe(false);
  });

  it('still catches the max flag', () => {
    expect(spendsAllGas(state, input(arcUsdc, bn('1'), true))).toBe(true);
  });

  it('defers to the not-enough-balance gate when nothing is held', () => {
    expect(spendsAllGas(stateWithBalances([]), input(arcUsdc, bn('1')))).toBe(false);
  });
});

describe('spendsAllGas where native and wnative are separate balances', () => {
  it('only reads the max flag, as the deposit token is not the gas token', () => {
    expect(spendsAllGas(state, input(baseNative, bn('10')))).toBe(false);
    expect(spendsAllGas(state, input(baseNative, bn('10'), true))).toBe(true);
  });

  it('ignores tokens that do not pay gas', () => {
    expect(spendsAllGas(state, input(baseUsdc, bn('10'), true))).toBe(false);
  });
});
