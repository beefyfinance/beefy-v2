import { describe, expect, it, vi } from 'vitest';
import { fetchBalanceAction } from '../../actions/balance.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { balanceSlice, initialBalanceState } from '../../reducers/wallet/balance.ts';
import { selectBalanceKeyForToken, selectUserBalanceOfToken } from '../../selectors/balance.ts';
import {
  ARC_USDC_ADDRESS,
  arcNative,
  arcUsdc,
  bn,
  makeState,
} from '../transact/helpers/same-balance.test-helper.ts';
import { BalanceAPI } from './balance.ts';

const { NATIVE_WEI } = vi.hoisted(() => ({ NATIVE_WEI: 10_000000500000000000n })); // 10.0000005

vi.mock('../rpc-contract/rpc-manager.ts', () => ({
  rpcClientManager: {
    getBatchClient: () => ({ getBalance: async () => NATIVE_WEI }),
  },
}));
vi.mock('../rpc-contract/viem-contract.ts', () => ({
  fetchContract: () => ({
    read: {
      getTokenBalances: async ([addresses]: [string[]]) => addresses.map(() => 0n),
      getBoostOrGovBalance: async () => [],
      getGovVaultMultiBalance: async () => [],
    },
  }),
}));
vi.mock(import('../../utils/feature-flags.ts'), async importOriginal => ({
  ...(await importOriginal()),
  featureFlag_getBalanceApiChunkSize: () => 100,
}));

const WALLET = '0xa55e75c4815ff39efd76c257857441d9fd99b45b';

const stateWith = (balance = initialBalanceState) => makeState({ user: { balance } });

const api = new BalanceAPI({ id: 'arc', appMulticallContractAddress: '0x1' } as ChainEntity);

describe('wallet balance where balanceSharedWithWrapped: one entry for native and wnative', () => {
  it.each([[[arcNative]], [[arcUsdc]], [[arcNative, arcUsdc]]])(
    'fetching %# stores one entry under the erc20 view, floored to its decimals',
    async tokens => {
      const result = await api.fetchAllBalances(stateWith(), { tokens }, WALLET);
      expect(result.tokens).toEqual([{ tokenAddress: ARC_USDC_ADDRESS, amount: bn('10') }]);
    }
  );

  it('native and wnative read the same stored balance and share a key', async () => {
    const data = await api.fetchAllBalances(stateWith(), { tokens: [arcNative] }, WALLET);
    const balance = balanceSlice.reducer(
      initialBalanceState,
      fetchBalanceAction.fulfilled(
        { chainId: 'arc', walletAddress: WALLET, data, state: stateWith() },
        'req',
        { chainId: 'arc' }
      )
    );
    const state = stateWith(balance);

    const native = selectUserBalanceOfToken(state, 'arc', 'native', WALLET);
    expect(native.toString(10)).toBe('10');
    expect(selectUserBalanceOfToken(state, 'arc', ARC_USDC_ADDRESS, WALLET)).toBe(native);
    expect(selectBalanceKeyForToken(state, 'arc', 'native')).toBe(
      selectBalanceKeyForToken(state, 'arc', ARC_USDC_ADDRESS)
    );
  });
});
