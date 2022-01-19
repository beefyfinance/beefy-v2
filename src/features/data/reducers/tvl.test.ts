import BigNumber from 'bignumber.js';
import {
  fetchGovVaultContractDataAction,
  FetchGovVaultFulfilledPayload,
  fetchStandardVaultContractDataAction,
  FetchStandardVaultFulfilledPayload,
} from '../actions/vault-contract';
import { getBeefyInitialState } from '../utils/test-utils';
import { tvlSlice, initialTvlState } from './tvl';

describe('TVL slice tests', () => {
  it('should do nothing on pending gov vault contract data', () => {
    const action = { type: fetchGovVaultContractDataAction.pending };
    const state = tvlSlice.reducer(initialTvlState, action);
    expect(state).toEqual(initialTvlState);
  });

  it('should do nothing on rejected gov vault contract data', () => {
    const action = { type: fetchGovVaultContractDataAction.rejected };
    const state = tvlSlice.reducer(initialTvlState, action);
    expect(state).toEqual(initialTvlState);
  });

  it('should update state on fulfilled gov vault contract data', () => {
    // we have loaded some entities already
    const state = getBeefyInitialState();
    const payload: FetchGovVaultFulfilledPayload = {
      chainId: 'harmony',
      data: [
        {
          id: 'bifi-gov',
          totalStaked: new BigNumber(123),
        },
      ],
      state,
    };
    const action = { type: fetchGovVaultContractDataAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initialTvlState, action);
    expect(newState).toMatchSnapshot();
  });

  it('should do nothing on pending standard vault contract data', () => {
    const action = { type: fetchStandardVaultContractDataAction.pending };
    const state = tvlSlice.reducer(initialTvlState, action);
    expect(state).toEqual(initialTvlState);
  });

  it('should do nothing on rejected standard vault contract data', () => {
    const action = { type: fetchStandardVaultContractDataAction.rejected };
    const state = tvlSlice.reducer(initialTvlState, action);
    expect(state).toEqual(initialTvlState);
  });

  it('should update state on fulfilled standard vault contract data', () => {
    // we have loaded some entities already
    const state = getBeefyInitialState();
    const payload: FetchStandardVaultFulfilledPayload = {
      chainId: 'harmony',
      data: [
        { id: 'bnb-eth-lp', balance: new BigNumber(123), pricePerFullShare: 12, strategy: 'test' },
      ],
      state,
    };
    const action = { type: fetchStandardVaultContractDataAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initialTvlState, action);
    expect(newState).toMatchSnapshot();
  });
});
