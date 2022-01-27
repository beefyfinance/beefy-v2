import BigNumber from 'bignumber.js';
import {
  ActionParams,
  fetchGovVaultContractDataAction,
  FetchGovVaultFulfilledPayload,
  fetchStandardVaultContractDataAction,
  FetchStandardVaultFulfilledPayload,
} from '../actions/vault-contract';
import {
  fetchBoostContractDataAction,
  FulfilledPayload as FetchBoostFulfilledPayload,
} from '../actions/boost-contract';
import { getBeefyTestingStore } from '../utils/test-utils';
import { tvlSlice, initialTvlState } from './tvl';
import { PayloadAction } from '@reduxjs/toolkit';
import { AsyncThunkFulfilledActionCreator } from '@reduxjs/toolkit/dist/createAsyncThunk';
import { BeefyState } from '../../redux/reducers';

describe('TVL slice tests', () => {
  it('should update state on fulfilled gov vault contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

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

  it('should update state on fulfilled standard vault contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

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

  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    let state = store.getState();

    // given we already have ppfs for the target vault
    store.dispatch({
      type: fetchStandardVaultContractDataAction.fulfilled,
      meta: {
        arg: {
          chainId: 'bsc',
        },
      },
      payload: {
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
      } as FetchStandardVaultFulfilledPayload,
    });
    state = store.getState();

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
    const newState = tvlSlice.reducer(state.biz.tvl, action);
    expect(newState).toMatchSnapshot();
  });
});
