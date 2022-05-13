import {
  fetchAllVaults,
  fetchFeaturedVaults,
  FulfilledAllVaultsPayload,
  FulfilledFeaturedVaultsPayload,
} from '../actions/vaults';
import {
  fetchAllContractDataByChainAction,
  FetchAllContractDataFulfilledPayload,
} from '../actions/contract-data';
import { vaultsSlice, initialVaultsState } from './vaults';
import { getBeefyTestingStore } from '../utils/test-utils';
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
            logo: 'single-assets/BIFI.png',
            name: 'BIFI Earnings Pool',
            token: 'BIFI',
            tokenDescription: 'Beefy.Finance',
            tokenAddress: '0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8',
            tokenDecimals: 18,
            tokenDescriptionUrl:
              'https://docs.beefy.finance/moo/ecosystem/bifi-token/tokenomics-and-governance',
            earnedToken: 'ONE',
            earnedTokenAddress: '0x5b96bbaca98d777cb736dd89a519015315e00d02',
            earnContractAddress: '0x5b96bbaca98d777cb736dd89a519015315e00d02',
            pricePerFullShare: 1,
            isGovVault: true,
            tvl: 0,
            oracle: 'tokens',
            oracleId: 'BIFI',
            oraclePrice: 0,
            status: 'active',
            platform: 'Beefy.Finance',
            assets: ['BIFI'],
            risks: [
              'COMPLEXITY_LOW',
              'BATTLE_TESTED',
              'IL_NONE',
              'MCAP_SMALL',
              'AUDIT',
              'CONTRACTS_VERIFIED',
            ],
            stratType: 'SingleStake',
            callFee: 0.5,
            withdrawalFee: '0%',
            createdAt: 1623706144,
            network: 'harmony',
          },

          // have one lp vault
          {
            id: 'sushi-one-1ygg-1eth',
            name: '1YGG-1ETH LP',
            token: '1YGG-1ETH LP',
            tokenDescription: 'Sushi',
            tokenAddress: '0x40112850EFd90e9e17b56de35d86BdFf9f4d07Fd',
            tokenDecimals: 18,
            tokenDescriptionUrl: '#',
            earnedToken: 'mooSushiYGG-ETH',
            earnedTokenAddress: '0x69F683aa79ab78B95A9823Ace8b9771Ad18fFC71',
            earnContractAddress: '0x69F683aa79ab78B95A9823Ace8b9771Ad18fFC71',
            pricePerFullShare: 1,
            tvl: 0,
            oracle: 'lps',
            oracleId: 'sushi-one-1ygg-1eth',
            oraclePrice: 0,
            status: 'active',
            platform: 'Sushi',
            assets: ['YGG', 'ETH'],
            callFee: 0.25,
            withdrawalFee: '0%',
            addLiquidityUrl:
              'https://app.sushi.com/add/0x6983D1E6DEf3690C4d616b13597A09e6193EA013/0x63cf309500d8be0B9fDB8F1fb66C821236c0438c',
            buyTokenUrl:
              'https://app.sushi.com/swap?inputCurrency=0x6983D1E6DEf3690C4d616b13597A09e6193EA013&outputCurrency=0x63cf309500d8be0B9fDB8F1fb66C821236c0438c',
            stratType: 'StratLP',
            network: 'harmony',
            risks: [
              'COMPLEXITY_LOW',
              'BATTLE_TESTED',
              'IL_LOW',
              'MCAP_MEDIUM',
              'AUDIT',
              'CONTRACTS_VERIFIED',
            ],
            createdAt: 1631279238,
          },

          // one retired vault
          {
            id: 'banana-banana-eol',
            logo: 'degens/BANANA.svg',
            name: 'BANANA',
            token: 'BANANA',
            tokenDescription: 'ApeSwap',
            tokenAddress: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
            tokenDecimals: 18,
            tokenDescriptionUrl: '#',
            earnedToken: 'mooApeBANANA',
            earnedTokenAddress: '0xD307e7CC6a302046b7D91D83aa4B8324cFB7a786',
            earnContractAddress: '0xD307e7CC6a302046b7D91D83aa4B8324cFB7a786',
            pricePerFullShare: 1,
            tvl: 0,
            oracle: 'tokens',
            oracleId: 'BANANA',
            oraclePrice: 0,
            status: 'eol',
            platform: 'ApeSwap',
            assets: ['BANANA'],
            buyTokenUrl:
              'https://dex.apeswap.finance/#/swap?inputCurrency=0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95&outputCurrency=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            stratType: 'SingleStake',
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
            balance: new BigNumber(12),
            pricePerFullShare: new BigNumber(123),
            strategy: 'test',
          },
          {
            id: 'sushi-one-1ygg-1eth',
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
            logo: 'single-assets/FUSE.svg',
            name: 'FUSE',
            token: 'FUSE',
            tokenDescription: 'Beefy Delegator',
            tokenDecimals: 18,
            tokenDescriptionUrl: '#',
            earnedToken: 'mooFuse',
            earnedTokenAddress: '0x2C43DBef81ABa6b95799FD2aEc738Cd721ba77f3',
            earnContractAddress: '0x2C43DBef81ABa6b95799FD2aEc738Cd721ba77f3',
            pricePerFullShare: 1,
            tvl: 0,
            oracle: 'tokens',
            oracleId: 'WFUSE',
            oraclePrice: 0,
            depositsPaused: false,
            status: 'active',
            platform: 'Fuse',
            assets: ['WFUSE'],
            risks: [],
            stratType: 'SingleStake',
            withdrawalFee: '0%',
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
