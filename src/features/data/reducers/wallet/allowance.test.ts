import BigNumber from 'bignumber.js';
import {
  fetchAllAllowanceAction,
  FetchAllAllowanceFulfilledPayload,
} from '../../actions/allowance';
import { allowanceSlice, initialAllowanceState } from './allowance';

describe('Allowance slice tests', () => {
  it('should update state on fulfilled allowance', () => {
    const payload: FetchAllAllowanceFulfilledPayload = {
      chainId: 'bsc',
      data: [
        { tokenId: 'token1', spenderAddress: '0x0001', allowance: new BigNumber(10) },
        { tokenId: 'token2', spenderAddress: '0x0001', allowance: new BigNumber(5) },
        { tokenId: 'token2', spenderAddress: '0x0002', allowance: new BigNumber(5) },
      ],
    };
    const action = { type: fetchAllAllowanceAction.fulfilled, payload: payload };
    const state = allowanceSlice.reducer(initialAllowanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byTokenId;
    const newState = allowanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byTokenId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });
});
