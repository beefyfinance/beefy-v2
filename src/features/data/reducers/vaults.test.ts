import type { FulfilledAllVaultsPayload, FulfilledFeaturedVaultsPayload } from '../actions/vaults';
import { fetchAllVaults, fetchFeaturedVaults } from '../actions/vaults';
import type { FetchAllContractDataFulfilledPayload } from '../actions/contract-data';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { vaultsSlice, initialVaultsState } from './vaults';
import { getBeefyTestingStore } from '../utils/test-utils';
import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';

describe('Vaults slice tests', () => {
  it('should update state on fulfilled vault list', async () => {
    const store = await getBeefyTestingStore();
    const payload: FulfilledAllVaultsPayload = {
      state: store.getState(),
      byChainId: {
        harmony: [
          // have one gov vault
          {
            id: 'one-bifi-gov',
            name: 'BIFI Earnings Pool',
            token: 'BIFI',
            tokenAddress: '0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8',
            tokenDecimals: 18,
            earnedToken: 'WONE',
            earnedTokenAddress: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a',
            earnedTokenDecimals: 18,
            earnContractAddress: '0x5b96bbaca98d777cb736dd89a519015315e00d02',
            oracle: 'tokens',
            oracleId: 'BIFI',
            status: 'active',
            retireReason: 'rewards',
            platformId: 'beefy',
            assets: ['BIFI'],
            risks: [
              'COMPLEXITY_LOW',
              'BATTLE_TESTED',
              'IL_NONE',
              'MCAP_SMALL',
              'AUDIT',
              'CONTRACTS_VERIFIED',
            ],
            strategyTypeId: 'single',
            isGovVault: true,
            network: 'harmony',
            createdAt: 1623706144,
          },

          // have one lp vault
          {
            id: 'sushi-one-1ygg-1eth-eol',
            name: '1YGG-1ETH LP',
            token: '1YGG-1ETH LP',
            tokenAddress: '0x40112850EFd90e9e17b56de35d86BdFf9f4d07Fd',
            tokenDecimals: 18,
            tokenProviderId: 'sushi',
            tokenAmmId: 'harmony-sushi',
            earnedToken: 'mooSushiYGG-ETH',
            earnedTokenAddress: '0x69F683aa79ab78B95A9823Ace8b9771Ad18fFC71',
            earnContractAddress: '0x69F683aa79ab78B95A9823Ace8b9771Ad18fFC71',
            oracle: 'lps',
            oracleId: 'sushi-one-1ygg-1eth',
            status: 'active',
            retireReason: 'rewards',
            platformId: 'sushi',
            assets: ['YGG', 'ETH'],
            risks: [
              'COMPLEXITY_LOW',
              'BATTLE_TESTED',
              'IL_LOW',
              'MCAP_MEDIUM',
              'AUDIT',
              'CONTRACTS_VERIFIED',
            ],
            strategyTypeId: 'lp',
            buyTokenUrl:
              'https://app.sushi.com/swap?inputCurrency=0x6983D1E6DEf3690C4d616b13597A09e6193EA013&outputCurrency=0x63cf309500d8be0B9fDB8F1fb66C821236c0438c',
            addLiquidityUrl:
              'https://www.sushi.com/earn/hmy-s0:0x40112850efd90e9e17b56de35d86bdff9f4d07fd/add',
            removeLiquidityUrl:
              'https://www.sushi.com/earn/hmy-s0:0x40112850efd90e9e17b56de35d86bdff9f4d07fd/remove',
            network: 'harmony',
            createdAt: 1631279238,
          },

          // one retired vault
          {
            id: 'banana-banana-eol',
            name: 'BANANA',
            token: 'BANANA',
            tokenAddress: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
            tokenDecimals: 18,
            earnedToken: 'mooApeBANANA',
            earnedTokenAddress: '0xD307e7CC6a302046b7D91D83aa4B8324cFB7a786',
            earnContractAddress: '0xD307e7CC6a302046b7D91D83aa4B8324cFB7a786',
            oracle: 'tokens',
            oracleId: 'BANANA',
            status: 'eol',
            platformId: 'apeswap',
            assets: ['BANANA'],
            strategyTypeId: 'single',
            buyTokenUrl:
              'https://apeswap.finance/swap?inputCurrency=0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95&outputCurrency=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            network: 'bsc',
            createdAt: 1615196201,
          },
        ],
      },
    };
    const action = { type: fetchAllVaults.fulfilled, payload: payload };
    const state = vaultsSlice.reducer(initialVaultsState, action);

    expect(state).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = Object.values(state.byId)[0];
    const newState = vaultsSlice.reducer(state, action);
    const afterReDispatch = newState.byId[beforeReDispatch.id];
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should update state on fulfilled vault list', async () => {
    const store = await getBeefyTestingStore();
    const state = store.getState();

    const payload: FetchAllContractDataFulfilledPayload = {
      chainId: 'harmony',
      data: {
        boosts: [],
        govVaults: [],
        standardVaults: [
          {
            id: 'one-bifi-gov',
            paused: false,
            balance: new BigNumber(12),
            pricePerFullShare: new BigNumber(123),
            strategy: 'test',
          },
          {
            id: 'sushi-one-1ygg-1eth',
            paused: false,
            balance: new BigNumber(24),
            pricePerFullShare: new BigNumber(456),
            strategy: 'test',
          },
        ],
      },
      state,
    };
    const action = { type: fetchAllContractDataByChainAction.fulfilled, payload: payload };
    const sliceState = vaultsSlice.reducer(state.entities.vaults, action);
    // don't snapshot all vaults from the test state
    expect(sliceState.contractData).toMatchSnapshot();

    // getting the same vaults don't update the state object
    const beforeReDispatch = sliceState.contractData;
    const newState = vaultsSlice.reducer(sliceState, action);
    const afterReDispatch = newState.contractData;
    expect(beforeReDispatch).toBe(afterReDispatch);
  });

  it('should track featured vault list', async () => {
    const payload: FulfilledFeaturedVaultsPayload = {
      byVaultId: {
        'test-vault': true,
        nope: false,
      },
    };
    const action = { type: fetchFeaturedVaults.fulfilled, payload: payload };
    const sliceState = vaultsSlice.reducer(initialVaultsState, action);
    // don't snapshot all vaults from the test state
    expect(sliceState.featuredVaults).toMatchSnapshot();
  });

  it('should handle fuse-fuse config correctly', async () => {
    const store = await getBeefyTestingStore();
    const payload: FulfilledAllVaultsPayload = {
      state: store.getState(),
      byChainId: {
        fuse: [
          {
            id: 'fuse-fuse',
            name: 'FUSE',
            token: 'FUSE',
            tokenDecimals: 18,
            earnedToken: 'mooFuse',
            earnedTokenAddress: '0x2C43DBef81ABa6b95799FD2aEc738Cd721ba77f3',
            earnContractAddress: '0x2C43DBef81ABa6b95799FD2aEc738Cd721ba77f3',
            oracle: 'tokens',
            oracleId: 'WFUSE',
            status: 'active',
            platformId: 'beefy',
            assets: ['WFUSE'],
            risks: [
              'COMPLEXITY_LOW',
              'BATTLE_TESTED',
              'IL_NONE',
              'MCAP_LARGE',
              'AUDIT',
              'CONTRACTS_VERIFIED',
            ],
            strategyTypeId: 'single',
            buyTokenUrl:
              'https://app.fuse.fi/#/swap?inputCurrency=FUSE&outputCurrency=0xa722c13135930332Eb3d749B2F0906559D2C5b99',
            network: 'fuse',
            createdAt: 1641908745,
          },
        ],
      },
    };
    const action = { type: fetchAllVaults.fulfilled, payload: payload };
    const state = vaultsSlice.reducer(initialVaultsState, action);

    expect(state).toMatchSnapshot();
  });
});
