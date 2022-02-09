import BigNumber from 'bignumber.js';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../actions/contract-data';
import { getBeefyTestingStore } from '../utils/test-utils';
import { tvlSlice, initialTvlState } from './tvl';

describe('TVL slice tests', () => {
  it('should update state on fulfilled gov vault contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

    const payload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        standardVaults: [],
        govVaults: [
          {
            id: 'bifi-gov',
            totalSupply: new BigNumber(123).times(18),
          },
        ],
      },
      state,
    };
    const action = { type: fetchAllContractDataByChainAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initialTvlState, action);
    expect(newState).toMatchSnapshot();
  });

  // TODO: have a test for testing exclusions

  it('should update state on fulfilled standard vault contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

    const payload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-cyt-bnb',
            balance: new BigNumber(123).times(new BigNumber(10).exponentiatedBy(18)),
            pricePerFullShare: new BigNumber(12).times(new BigNumber(10).exponentiatedBy(18)),
            strategy: '0x00000000000000000000000',
          },
        ],
      },
      state,
    };
    const action = { type: fetchAllContractDataByChainAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initialTvlState, action);
    expect(newState).toMatchSnapshot();
  });

  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    let state = store.getState();

    // We want to make sure we handle the action properly
    const payload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [
          {
            id: 'moo_banana-banana-busd-bitcrush',
            periodFinish: 1234,
            rewardRate: new BigNumber(0.4),
            totalSupply: new BigNumber(12345),
          },
        ],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-banana-busd',
            balance: new BigNumber(123).times(new BigNumber(10).exponentiatedBy(18)),
            pricePerFullShare: new BigNumber(12).times(new BigNumber(10).exponentiatedBy(18)),
            strategy: '0x00000000000000000000000',
          },
        ],
      },
      state,
    };
    const action = { type: fetchAllContractDataByChainAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(state.biz.tvl, action);
    expect(newState).toMatchSnapshot();
  });
});
