import { BeefyState } from '../../../redux-types';
import { fetchAllBoosts, FulfilledAllBoostsPayload } from '../actions/boosts';
import { fetchAllVaults, FulfilledAllVaultsPayload } from '../actions/vaults';
import { platformsSlice, initialPlatformsState } from './platforms';

describe('Platforms slice tests', () => {
  it('should update state on fulfilled vault list', () => {
    const payload: FulfilledAllVaultsPayload = {
      state: {} as BeefyState,
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
          },
        ],
      },
    };
    const action = { type: fetchAllVaults.fulfilled, payload: payload };
    const state = platformsSlice.reducer(initialPlatformsState, action);
    expect(state).toMatchSnapshot();
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
    const state = platformsSlice.reducer(initialPlatformsState, action);
    expect(state).toMatchSnapshot();
  });
});
