import BigNumber from 'bignumber.js';
import {
  fetchBoostContractDataAction,
  FulfilledPayload as FetchBoostFulfilledPayload,
} from '../actions/boost-contract';
import { getBeefyTestingStore } from '../utils/test-utils';
import { apySlice, initialApyState } from './apy';

describe('APY slice tests', () => {
  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

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
