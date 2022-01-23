import BigNumber from 'bignumber.js';
import {
  fetchBoostAllowanceAction,
  FetchBoostAllowanceFulfilledPayload,
  fetchGovVaultPoolsAllowanceAction,
  FetchGovVaultPoolsAllowanceFulfilledPayload,
} from '../actions/allowance';
import { allowanceSlice, initialAllowanceState } from './allowance';

describe('Allowance slice tests', () => {
  it('should update state on fulfilled gov pool allowance', () => {
    const payload: FetchGovVaultPoolsAllowanceFulfilledPayload = {
      chainId: 'bsc',
      data: [
        { vaultId: 'banana-nfty-wbnb', spenderAddress: '0x000', allowance: new BigNumber(10) },
        { vaultId: 'belt-beltbnb', spenderAddress: '0x000', allowance: new BigNumber(5) },
      ],
    };
    const action = { type: fetchGovVaultPoolsAllowanceAction.fulfilled, payload: payload };
    const state = allowanceSlice.reducer(initialAllowanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byVaultId;
    const newState = allowanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byVaultId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled boost allowance', () => {
    const payload: FetchBoostAllowanceFulfilledPayload = {
      chainId: 'bsc',
      data: [
        {
          boostId: 'moo_ellipsis-renbtc-charge',
          allowance: new BigNumber(100),
          spenderAddress: '0x000',
        },
        {
          boostId: 'moo_beltbnb-czodiac',
          allowance: new BigNumber(100),
          spenderAddress: '0x000',
        },
      ],
    };
    const action = { type: fetchBoostAllowanceAction.fulfilled, payload: payload };
    const state = allowanceSlice.reducer(initialAllowanceState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = state.byChainId['bsc'].byBoostId;
    const newState = allowanceSlice.reducer(state, action);
    const afterReDispatch = newState.byChainId['bsc'].byBoostId;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });
});
