import BigNumber from 'bignumber.js';
import {
  fetchBoostContractDataAction,
  FulfilledPayload as FetchBoostFulfilledPayload,
} from '../actions/boost-contract';
import { getBeefyTestingInitialState } from '../utils/test-utils';
import { apySlice, initialApyState } from './apy';

describe('APY slice tests', () => {
  it('should do nothing on pending boost contract data', () => {
    const action = { type: fetchBoostContractDataAction.pending };
    const state = apySlice.reducer(initialApyState, action);
    expect(state).toEqual(initialApyState);
  });

  it('should do nothing on rejected boost contract data', () => {
    const action = { type: fetchBoostContractDataAction.rejected };
    const state = apySlice.reducer(initialApyState, action);
    expect(state).toEqual(initialApyState);
  });

  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const state = await getBeefyTestingInitialState();

    // We want to make sure we handle the action properly
    const payload: FetchBoostFulfilledPayload = {
      chainId: 'bsc',
      data: [
        {
          id: 'moo_banana-banana-busd-bitcrush',
          periodFinish: 1234,
          rewardRate: new BigNumber(0.4),
          totalStaked: new BigNumber(12345),
        },
      ],
      state,
    };
    const action = { type: fetchBoostContractDataAction.fulfilled, payload: payload };
    const newState = apySlice.reducer(initialApyState, action);
    expect(newState).toMatchSnapshot();
  });
});
