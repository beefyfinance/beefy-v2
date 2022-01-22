import BigNumber from 'bignumber.js';
import {
  fetchTokenBalanceAction,
  FulfilledPayload as FetchTokenBalanceActionPayload,
} from '../actions/token-balance';
import { balanceSlice, initialBalanceState } from './balance';

describe('Balance slice tests', () => {
  it('should do nothing on pending token balance', () => {
    const action = { type: fetchTokenBalanceAction.pending };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toEqual(initialBalanceState);
  });

  it('should do nothing on rejected chain config list', () => {
    const action = { type: fetchTokenBalanceAction.rejected };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toEqual(initialBalanceState);
  });

  it('should update state on fulfilled chain config list', () => {
    const payload: FetchTokenBalanceActionPayload = {
      chainId: 'bsc',
      data: [
        { tokenId: 'banana-nfty-wbnb', amount: new BigNumber(10) },
        { tokenId: 'BIFI', amount: new BigNumber(10) },
      ],
    };
    const action = { type: fetchTokenBalanceAction.fulfilled, payload: payload };
    const state = balanceSlice.reducer(initialBalanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byTokenId;
    const newState = balanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byTokenId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });
});
