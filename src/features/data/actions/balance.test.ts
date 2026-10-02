import { describe, expect, it, vi } from 'vitest';
import { makeState } from '../apis/transact/helpers/same-balance.test-helper.ts';
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

/**
 * The 60s poll awaits a captured fulfilled action, so a thunk that dispatches nothing stops the
 * poll for that chain for the rest of the session
 */
describe.each([
  [
    'fetchAllBalanceAction',
    (chainId: ChainEntity['id']) => fetchAllBalanceAction({ chainId, walletAddress: WALLET }),
  ],
  ['fetchBalanceAction', (chainId: ChainEntity['id']) => fetchBalanceAction({ chainId })],
])('%s', (_name, makeThunk) => {
  it.each([
    ['where balanceSharedWithWrapped', 'arc' as const],
    ['on other chains', 'base' as const],
  ])('always settles %s, addressbook or not', async (_case, chainId) => {
    for (const addressBookLoaded of [false, true]) {
      const types = await dispatchedTypes(makeThunk(chainId), addressBookLoaded);
      expect(types[0]).toMatch(/\/pending$/);
      expect(types[types.length - 1]).toMatch(/\/(fulfilled|rejected)$/);
    }
  });
});
