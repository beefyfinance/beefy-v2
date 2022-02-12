import BigNumber from 'bignumber.js';
import { FetchAllApyFulfilledPayload, fetchApyAction } from '../actions/apy';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../actions/contract-data';
import { getBeefyTestingStore } from '../utils/test-utils';
import { apySlice, initialApyState } from './apy';

describe('APY slice tests', () => {
  it('should update state on fulfilled apy data action', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

    // We want to make sure we handle the action properly
    const payload: FetchAllApyFulfilledPayload = {
      data: {
        // one standard vault
        'ellipsis-renbtc': {
          vaultApr: 0.03346493761979882,
          compoundingsPerYear: 2190,
          beefyPerformanceFee: 0.045,
          vaultApy: 0.03403092311211742,
          lpFee: 0.0002,
          tradingApr: 0.000309155,
          totalApy: 0.0343505989421522,
        },
        // one boosted standard vault
        'banana-banana-busd': {
          vaultApr: 0.03346493761979882,
          compoundingsPerYear: 2190,
          beefyPerformanceFee: 0.045,
          vaultApy: 0.03403092311211742,
          lpFee: 0.0002,
          tradingApr: 0.000309155,
          totalApy: 0.0343505989421522,
        },
        // one gov vault
        'one-bifi-gov': { vaultApr: 0.01385586450952859762 },
        // one maxi vault
        'one-bifi-maxi': { totalApy: 0.01401646541942525 },

        // one that does not exists locally yet
        'future-extra-super-hyped-vault': { vaultApr: 0.01385586450952859762 },
      },
      state,
    };
    const action = { type: fetchApyAction.fulfilled, payload: payload };
    const newState = apySlice.reducer(initialApyState, action);
    expect(newState).toMatchSnapshot();

    // now, we get a boost info
    // we should compute total boost apr/y
    const boostPayload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        govVaults: [],
        standardVaults: [],
        boosts: [
          {
            id: 'moo_banana-banana-busd-bitcrush',
            periodFinish: new Date(2050, 0, 1, 0, 0, 0),
            rewardRate: new BigNumber('123'),
            totalSupply: new BigNumber('12345'),
          },
        ],
      },
      state,
    };
    const boostAction = {
      type: fetchAllContractDataByChainAction.fulfilled,
      payload: boostPayload,
    };
    const newBoostedState = apySlice.reducer(newState, boostAction);
    expect(newBoostedState).toMatchSnapshot();
  });

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
            periodFinish: new Date(2050, 0, 1, 0, 0, 0),
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
