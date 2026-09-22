import { describe, expect, it, vi } from 'vitest';
import { makeState } from '../apis/transact/helpers/same-balance-fixture.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { fetchAllBalanceAction, fetchBalanceAction } from './balance.ts';

vi.mock('../apis/instances.ts', () => ({
  getBalanceApi: async () => ({
    fetchAllBalances: async () => ({ tokens: [], govVaults: [], boosts: [], erc4626Pending: [] }),
  }),
}));

const WALLET = '0xa55e75c4815ff39efd76c257857441d9fd99b45b';

function stateWith(addressBookLoaded: boolean) {
  return makeState({
    ui: {
      dataLoader: {
        global: { addressBook: addressBookLoaded ? { lastFulfilled: 1 } : undefined },
        byChainId: {},
      },
    },
    user: { wallet: { address: WALLET } },
  });
}

async function dispatchedTypes(
  thunk: ReturnType<typeof fetchAllBalanceAction | typeof fetchBalanceAction>,
  addressBookLoaded: boolean
) {
  const dispatch = vi.fn();
  await thunk(dispatch, () => stateWith(addressBookLoaded), undefined);
  return dispatch.mock.calls.map(([action]) => (action as { type: string }).type);
}

describe.each([
  [
    'fetchAllBalanceAction',
    (chainId: ChainEntity['id']) => fetchAllBalanceAction({ chainId, walletAddress: WALLET }),
  ],
  ['fetchBalanceAction', (chainId: ChainEntity['id']) => fetchBalanceAction({ chainId })],
])('%s', (_name, makeThunk) => {
  it('waits for the addressbook where native and wnative share a balance', async () => {
    expect(await dispatchedTypes(makeThunk('arc'), false)).toEqual([]);
  });

  it('runs once that addressbook has loaded', async () => {
    const types = await dispatchedTypes(makeThunk('arc'), true);
    expect(types[0]).toMatch(/\/pending$/);
  });

  it('never waits on other chains', async () => {
    const types = await dispatchedTypes(makeThunk('base'), false);
    expect(types[0]).toMatch(/\/pending$/);
  });
});
