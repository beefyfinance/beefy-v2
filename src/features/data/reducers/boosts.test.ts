import BigNumber from 'bignumber.js';
import { fetchAllBoosts, FulfilledAllBoostsPayload } from '../actions/boosts';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../actions/contract-data';
import { getBeefyTestingStore } from '../utils/test-utils';
import { boostsSlice, initialBoostsState, recomputeBoostStatus } from './boosts';

describe('Boosts slice tests', () => {
  it('should update state on fulfilled boosts list', () => {
    const payload: FulfilledAllBoostsPayload = {
      harmony: [
        // one with a partnership
        {
          id: 'moo_banana-pera',
          poolId: 'banana-banana-eol',
          name: 'Pera',
          logo: 'degens/BANANA.svg',
          earnedToken: 'PERA',
          earnedTokenDecimals: 18,
          earnedTokenAddress: '0xb9D8592E16A9c1a3AE6021CDDb324EaC1Cbc70d6',
          earnContractAddress: '0x38247fCE28480A7BEF2CB7aD134ce091Bd2E1a82',
          earnedOracle: 'tokens',
          earnedOracleId: 'PERA',
          partnership: true,
          status: 'active',
          isMooStaked: true,
          partners: [
            {
              logo: 'stake/pera/logo.png',
              background: 'stake/pera/bg.png',
              text: "Pera Finance is a decentralized trading competition platform with multi-layered yield farming opportunities. Traders, liquidity providers and holders yield farm together through the DeFi's first decentralized trading competition. Every on-chain PERA transaction (transfer, trade, or liquidity addition/ removal) generates a 2 % transaction fee.",
              website: 'https://pera.finance/',
              social: {
                telegram: 'https://t.me/perafinance',
                twitter: 'https://twitter.com/perafinance',
              },
            },
          ],
        },

        // one closed boost
        {
          id: 'moo_aave-btc',
          poolId: 'aave-wbtc',
          name: 'Iron / Garuda / Fanatics',
          logo: 'single-assets/BTCB.svg',
          earnedToken: 'mooPolygonBIFI',
          earnedTokenDecimals: 18,
          earnedTokenAddress: '0xfEcf784F48125ccb7d8855cdda7C5ED6b5024Cb3',
          earnContractAddress: '0x20948Cad130c3D7B24d27CC66163b4aaed4684F0',
          earnedOracle: 'tokens',
          earnedOracleId: 'BIFI',
          partnership: true,
          status: 'closed',
          isMooStaked: true,
          partners: [],
        },

        // one with pre-staking boost
        {
          id: 'moo_aave-eth',
          poolId: 'aave-eth',
          name: 'Iron / Garuda / Fanatics',
          logo: 'single-assets/ETH.svg',
          earnedToken: 'mooPolygonBIFI',
          earnedTokenDecimals: 18,
          earnedTokenAddress: '0xfEcf784F48125ccb7d8855cdda7C5ED6b5024Cb3',
          earnContractAddress: '0x9B508ad657ed5A139D1a7c97fD84d7B7240849Cf',
          earnedOracle: 'tokens',
          earnedOracleId: 'BIFI',
          partnership: true,
          status: 'prestake',
          isMooStaked: true,
        },
      ],
    };
    const action = { type: fetchAllBoosts.fulfilled, payload: payload };
    const state = boostsSlice.reducer(initialBoostsState, action);
    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = Object.values(state.byId)[0];
    const newState = boostsSlice.reducer(state, action);
    const afterReDispatch = newState.byId[beforeReDispatch.id];
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled boost contract data', async () => {
    // we have loaded some entities already
    const store = await getBeefyTestingStore();
    const state = store.getState();

    // given we have received data for some boosts
    const initPayload: FulfilledAllBoostsPayload = {
      bsc: [
        {
          id: 'moo_banana-banana-busd-bitcrush',
          poolId: 'aave-wbtc',
          name: 'Iron / Garuda / Fanatics',
          logo: 'single-assets/BTCB.svg',
          earnedToken: 'mooPolygonBIFI',
          earnedTokenDecimals: 18,
          earnedTokenAddress: '0xfEcf784F48125ccb7d8855cdda7C5ED6b5024Cb3',
          earnContractAddress: '0x20948Cad130c3D7B24d27CC66163b4aaed4684F0',
          earnedOracle: 'tokens',
          earnedOracleId: 'BIFI',
          partnership: true,
          status: '',
          isMooStaked: true,
          partners: [],
        },
        {
          id: 'moo_banana-bnb-stars-mogul2',
          poolId: 'aave-eth',
          name: 'Iron / Garuda / Fanatics',
          logo: 'single-assets/ETH.svg',
          earnedToken: 'mooPolygonBIFI',
          earnedTokenDecimals: 18,
          earnedTokenAddress: '0xfEcf784F48125ccb7d8855cdda7C5ED6b5024Cb3',
          earnContractAddress: '0x9B508ad657ed5A139D1a7c97fD84d7B7240849Cf',
          earnedOracle: 'tokens',
          earnedOracleId: 'BIFI',
          partnership: true,
          status: '',
          isMooStaked: true,
        },
      ],
    };
    const initAction = { type: fetchAllBoosts.fulfilled, payload: initPayload };
    const initState = boostsSlice.reducer(initialBoostsState, initAction);

    // We want to make sure we handle the action properly
    const payload: FetchAllContractDataFulfilledPayload = {
      chainId: 'bsc',
      data: {
        govVaults: [],
        standardVaults: [],
        boosts: [
          {
            id: 'moo_banana-banana-busd-bitcrush',
            periodFinish: new Date(2022, 0, 1, 0, 0, 0), // expired boost
            rewardRate: new BigNumber(0.4),
            totalSupply: new BigNumber(12345),
          },
          {
            id: 'moo_banana-bnb-stars-mogul2',
            periodFinish: new Date(2250, 0, 1, 0, 0, 0), // active boost
            rewardRate: new BigNumber(0.4),
            totalSupply: new BigNumber(12345),
          },
          {
            id: 'moo_banana-crush-wbnb-bitcrush',
            periodFinish: null, // prestake boost
            rewardRate: new BigNumber(0.4),
            totalSupply: new BigNumber(12345),
          },
        ],
      },
      state,
    };
    const action = { type: fetchAllContractDataByChainAction.fulfilled, payload: payload };
    const newState = boostsSlice.reducer(initState, action);
    expect(newState).toMatchSnapshot();

    // We don't want the state to change reference when recomputing boost status
    const stateAfterRecompute1 = boostsSlice.reducer(newState, action);
    expect(stateAfterRecompute1).toBe(newState);

    // We don't want the state to change reference when recomputing boost status
    const stateAfterRecompute2 = boostsSlice.reducer(stateAfterRecompute1, {
      type: recomputeBoostStatus,
    });
    expect(stateAfterRecompute2).toBe(newState);
  });
});
