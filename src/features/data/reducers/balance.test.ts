import BigNumber from 'bignumber.js';
import { fetchAllBalanceAction, FetchAllBalanceFulfilledPayload } from '../actions/balance';
import { balanceSlice, initialBalanceState } from './balance';

describe('Balance slice tests', () => {
  it('should update state on fulfilled token balance', () => {
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        tokens: [
          { tokenId: 'banana-nfty-wbnb', amount: new BigNumber(10) },
          { tokenId: 'BIFI', amount: new BigNumber(10) },
        ],
      },
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byTokenId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byTokenId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled gov boost pools', () => {
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        tokens: [],
        govVaults: [
          { vaultId: 'banana-nfty-wbnb', rewards: new BigNumber(100), balance: new BigNumber(10) },
          { vaultId: 'belt-beltbnb', rewards: new BigNumber(10), balance: new BigNumber(5) },
        ],
      },
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byVaultId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byVaultId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled boost balance', () => {
    const payload: FetchAllBalanceFulfilledPayload = {
      chainId: 'bsc',
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
    };
    const action = { type: fetchAllBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byBoostId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byBoostId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });
});
