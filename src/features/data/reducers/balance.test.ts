import BigNumber from 'bignumber.js';
import { fetchAllBalanceAction, FetchAllBalanceFulfilledPayload } from '../actions/balance';
import { balanceSlice, initialBalanceState } from './balance';
import { getBeefyTestingStore } from '../utils/test-utils';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../actions/contract-data';

describe('Balance slice tests', () => {
  it('should update state on fulfilled token balance', async () => {
    const store = await getBeefyTestingStore();
    // given we have some prior info
    const initPayload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-bnb-stars',
            pricePerFullShare: new BigNumber(5),
            balance: new BigNumber(123),
            strategy: 'test',
          },
        ],
      },
      state: store.getState(),
    };
    store.dispatch({ type: fetchAllContractDataByChainAction.fulfilled, payload: initPayload });

    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      walletAddress: '0x00ABC',
      data: {
        boosts: [],
        govVaults: [],
        tokens: [
          { tokenId: 'banana-nfty-wbnb', amount: new BigNumber(10) },
          { tokenId: 'BIFI', amount: new BigNumber(10) },
          { tokenId: 'mooApeBNB-STARS', amount: new BigNumber(10) },
        ],
      },
      state: store.getState(),
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(store.getState().user.balance, action);
    expect(state).toMatchSnapshot();

    expect(state.byAddress['0x00abc']).toBeDefined();
    expect(state.byAddress['0x00abcdef']).toBeUndefined();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byAddress['0x00abc'].byChainId['bsc'].byTokenId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byAddress['0x00abc'].byChainId['bsc'].byTokenId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled gov boost pools', async () => {
    const store = await getBeefyTestingStore();

    // given we have some prior info
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      walletAddress: '0x00ABC',
      data: {
        boosts: [],
        tokens: [],
        govVaults: [
          { vaultId: 'bifi-gov', rewards: new BigNumber(100), balance: new BigNumber(10) },
        ],
      },
      state: store.getState(),
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    expect(state.byAddress['0x00abc']).toBeDefined();
    expect(state.byAddress['0x00abcdef']).toBeUndefined();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byAddress['0x00abc'].byChainId['bsc'].byGovVaultId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byAddress['0x00abc'].byChainId['bsc'].byGovVaultId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled boost balance', async () => {
    const store = await getBeefyTestingStore();
    // given we have some prior info
    const initPayload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'ellipsis-renbtc',
            pricePerFullShare: new BigNumber(5),
            balance: new BigNumber(123),
            strategy: 'test',
          },
          {
            id: 'belt-beltbnb',
            pricePerFullShare: new BigNumber(50),
            balance: new BigNumber(1230),
            strategy: 'test',
          },
        ],
      },
      state: store.getState(),
    };
    store.dispatch({ type: fetchAllContractDataByChainAction.fulfilled, payload: initPayload });

    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      walletAddress: '0x00ABC',
      data: {
        govVaults: [],
        tokens: [],
        boosts: [
          {
            boostId: 'moo_ellipsis-renbtc-charge',
            balance: new BigNumber(100),
            rewards: new BigNumber(10),
          },
          {
            boostId: 'moo_beltbnb-czodiac',
            balance: new BigNumber(100),
            rewards: new BigNumber(10),
          },
        ],
      },
      state: store.getState(),
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    expect(state.byAddress['0x00abc']).toBeDefined();
    expect(state.byAddress['0x00abcdef']).toBeUndefined();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byAddress['0x00abc'].byChainId['bsc'].byBoostId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byAddress['0x00abc'].byChainId['bsc'].byBoostId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });
});
