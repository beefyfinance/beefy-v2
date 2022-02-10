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
            balance: new BigNumber(123),
            pricePerFullShare: new BigNumber(12),
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
            periodFinish: new Date(2022, 0, 1, 0, 0, 0),
            rewardRate: new BigNumber(0.4),
            totalSupply: new BigNumber(12345),
          },
        ],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-banana-busd',
            balance: new BigNumber(123),
            pricePerFullShare: new BigNumber(12),
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

  it('should fully recompute total TVL when getting new chain data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    let state = store.getState();

    const bscPayload1: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-cyt-bnb',
            balance: new BigNumber(123),
            pricePerFullShare: new BigNumber(12),
            strategy: '0x00000000000000000000000',
          },
        ],
      },
      state,
    };

    const bscPayload2: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'banana-cyt-bnb',
            balance: new BigNumber(3456),
            pricePerFullShare: new BigNumber(456),
            strategy: '0x00000000000000000000000',
          },
        ],
      },
      state,
    };
    const avaxPayload: FetchAllContractDataFulfilledPayload = {
      chainId: 'avax',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'joe-mai-wavax-eol',
            balance: new BigNumber(123),
            pricePerFullShare: new BigNumber(12),
            strategy: '0x00000000000000000000000',
          },
        ],
      },
      state,
    };

    // first, we get some bsc info
    let action = { type: fetchAllContractDataByChainAction.fulfilled, payload: bscPayload1 };
    let sliceState = tvlSlice.reducer(initialTvlState, action);
    expect(sliceState.totalTvl).toMatchSnapshot();

    // then we get avax infos
    action = { type: fetchAllContractDataByChainAction.fulfilled, payload: avaxPayload };
    sliceState = tvlSlice.reducer(sliceState, action);
    expect(sliceState.totalTvl).toMatchSnapshot();

    // then, we get new bsc info, we should not keep adding up but recompute TVL from scratch
    action = { type: fetchAllContractDataByChainAction.fulfilled, payload: bscPayload2 };
    sliceState = tvlSlice.reducer(sliceState, action);
    expect(sliceState.totalTvl).toMatchSnapshot();
  });
});
