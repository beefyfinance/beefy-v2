import BigNumber from 'bignumber.js';
import {
  fetchGovVaultContractDataAction,
  FetchGovVaultFulfilledPayload,
  fetchStandardVaultContractDataAction,
  FetchStandardVaultFulfilledPayload,
} from '../actions/vault-contract';
import {
  fetchBoostContractDataAction,
  FulfilledPayload as FetchBoostFulfilledPayload,
} from '../actions/boost-contract';
import { getBeefyTestingInitialState } from '../utils/test-utils';
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

  it('should update state on fulfilled gov vault contract data', async () => {
    // we have loaded some entities already
    const state = await getBeefyTestingInitialState();
    const payload: FetchGovVaultFulfilledPayload = {
      chainId: 'bsc',
      data: [
        {
          id: 'bifi-gov',
          totalStaked: new BigNumber(123).times(18),
        },
      ],
      state,
    };
    const action = { type: fetchGovVaultContractDataAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initialTvlState, action);
    expect(newState).toMatchSnapshot();
  });

  // TODO: have a test for testing exclusions

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

  it('should update state on fulfilled standard vault contract data', async () => {
    // we have loaded some entities already
    const state = await getBeefyTestingInitialState();
    const payload: FetchStandardVaultFulfilledPayload = {
      chainId: 'bsc',
      data: [
        {
          id: 'banana-cyt-bnb',
          balance: new BigNumber(123).times(new BigNumber(10).exponentiatedBy(18)),
          pricePerFullShare: new BigNumber(12).times(new BigNumber(10).exponentiatedBy(18)),
          strategy: '0x00000000000000000000000',
        },
      ],
      state,
    };
    const action = { type: fetchStandardVaultContractDataAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initialTvlState, action);
    expect(newState).toMatchSnapshot();
  });

  it('should do nothing on pending boost contract data', () => {
    const action = { type: fetchBoostContractDataAction.pending };
    const state = tvlSlice.reducer(initialTvlState, action);
    expect(state).toEqual(initialTvlState);
  });

  it('should do nothing on rejected boost contract data', () => {
    const action = { type: fetchBoostContractDataAction.rejected };
    const state = tvlSlice.reducer(initialTvlState, action);
    expect(state).toEqual(initialTvlState);
  });

  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const state = await getBeefyTestingInitialState();
    // given we already have ppfs for the target vault
    const initPayload: FetchStandardVaultFulfilledPayload = {
      chainId: 'bsc',
      data: [
        {
          id: 'banana-banana-busd',
          balance: new BigNumber(123).times(new BigNumber(10).exponentiatedBy(18)),
          pricePerFullShare: new BigNumber(12).times(new BigNumber(10).exponentiatedBy(18)),
          strategy: '0x00000000000000000000000',
        },
      ],
      state,
    };
    const initiatedTvlState = tvlSlice.reducer(initialTvlState, {
      type: fetchStandardVaultContractDataAction.fulfilled,
      payload: initPayload,
    });

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
      // replace new state in the full state
      state: {
        ...state,
        entities: {
          ...state.entities,
          tvl: initiatedTvlState,
        },
      },
    };
    const action = { type: fetchBoostContractDataAction.fulfilled, payload: payload };
    const newState = tvlSlice.reducer(initiatedTvlState, action);
    expect(newState).toMatchSnapshot();
  });
});
