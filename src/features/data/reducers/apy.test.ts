import BigNumber from 'bignumber.js';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../actions/contract-data';
import { getBeefyTestingStore } from '../utils/test-utils';
import { apySlice, initialApyState } from './apy';

describe('APY slice tests', () => {
  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

    // We want to make sure we handle the action properly
    const payload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        govVaults: [],
        standardVaults: [],
        boosts: [
          {
            id: 'moo_banana-banana-busd-bitcrush',
            periodFinish: new Date(2022, 0, 1, 0, 0, 0),
            rewardRate: new BigNumber(0.4),
            totalSupply: new BigNumber(12345),
          },
        ],
      },
      state,
    };
    const action = { type: fetchAllContractDataByChainAction.fulfilled, payload: payload };
    const newState = apySlice.reducer(initialApyState, action);
    expect(newState).toMatchSnapshot();
  });
});
