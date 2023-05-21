import { fetchAllBoosts } from '../actions/boosts';
import type { FulfilledAllBoostsPayload } from '../actions/boosts';
import type { fetchAllPricesPayload } from '../actions/prices';
import { fetchAllPricesAction } from '../actions/prices';
import { fetchAddressBookAction } from '../actions/tokens';
import { fetchAllVaults } from '../actions/vaults';
import type { FulfilledAllVaultsPayload } from '../actions/vaults';
import { selectChainNativeToken } from '../selectors/tokens';
import { getBeefyTestingStore } from '../utils/test-utils';
import { describe, expect, it } from 'vitest';
import { initialTokensState, tokensSlice } from './tokens';

describe('Tokens slice tests', () => {
  it('should update state on fulfilled vault list', async () => {
    const store = await getBeefyTestingStore();
    const state = store.getState();
    const payload: FulfilledAllVaultsPayload = {
      state,
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
        ],
      },
    };
    const action = { type: fetchAllVaults.fulfilled, payload: payload };
    const newState = tokensSlice.reducer(initialTokensState, action);
    expect(newState).toMatchSnapshot();
  });

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
          status: 'closed',
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
      ],
    };
    const action = { type: fetchAllBoosts.fulfilled, payload: payload };
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toMatchSnapshot();
  });

  it('should update state on fulfilled prices list', () => {
    const payload: fetchAllPricesPayload = {
      prices: {
        '1AAVE': 238.16568740268866,
        '1AXS': 79.04891966147113,
        '1BTC': 609115.1079533856,
        '1inch-1inch-bnb': 0,
        '2omb-2omb-ftm': 16.710317081168196,
        '2omb-2share-ftm': 171.84420463276956,
        // when rpc are down, the API might send us nulls
        // in this case, we say 1 token = $1
        'solarbeam-avax-wmovr': null,
        'solarbeam-bnb-busd': null,
      },
      breakdowns: {},
    };
    const action = { type: fetchAllPricesAction.fulfilled, payload: payload };
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toMatchSnapshot();
  });

  it('should correctly handle mooFuse config', () => {
    const payload: FulfilledAllBoostsPayload = {
      fuse: [
        {
          id: 'moo_fusefi-wfuse-usdc-fuse',
          poolId: 'voltage-wfuse-usdc',
          name: 'Fuse',
          assets: ['USDC', 'FUSE'],
          earnedToken: 'mooFuse',
          earnedTokenDecimals: 18,
          earnedTokenAddress: '0x2C43DBef81ABa6b95799FD2aEc738Cd721ba77f3',
          earnContractAddress: '0x405EE7F4f067604b787346bC22ACb66b06b15A4B',
          earnedOracle: 'tokens',
          earnedOracleId: 'WFUSE',
          partnership: true,
          status: 'active',
          isMooStaked: true,
          partners: [
            {
              logo: 'stake/fuse/logo.png',
              background: 'stake/fuse/bg.png',
              text: 'Fuse is a platform featuring a fast and low-cost, Ethereum-compatible blockchain, a robust plug-and-play mobile-centric crypto payments infrastructure for creating token-based applications and a rapidly growing ecosystem of payments, decentralized finance and NFT projects.',
              website: 'https://www.fuse.io',
              social: {
                telegram: 'https://t.me/fuseio',
                twitter: 'https://twitter.com/Fuse_network',
              },
            },
          ],
        },
      ],
    };
    const action = { type: fetchAllBoosts.fulfilled, payload: payload };
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toMatchSnapshot();
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
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toMatchSnapshot();
  });

  it('should update addressable native token addresses when fetching the address book', async () => {
    const store = await getBeefyTestingStore();
    await store.dispatch(fetchAddressBookAction({ chainId: 'metis' }));
    await store.dispatch(fetchAddressBookAction({ chainId: 'celo' }));
    await store.dispatch(fetchAddressBookAction({ chainId: 'bsc' }));
    const state = store.getState();
    const metisNative = selectChainNativeToken(state, 'metis');
    const celoNative = selectChainNativeToken(state, 'celo');
    const bscNative = selectChainNativeToken(state, 'bsc');
    expect(metisNative.address).toBe('native');
    expect(celoNative.address).toBe('native');
    expect(bscNative.address).toBe('native');
  });
});
