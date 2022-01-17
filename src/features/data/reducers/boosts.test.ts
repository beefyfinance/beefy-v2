import {
  fetchBoostsByChainIdAction,
  FulfilledPayload as FetchBoostsActionPayload,
} from '../actions/boosts';
import { boostsSlice, initialBoostsState } from './boosts';

describe('Boosts slice tests', () => {
  it('should do nothing on pending boosts list', () => {
    const action = { type: fetchBoostsByChainIdAction.pending };
    const state = boostsSlice.reducer(initialBoostsState, action);
    expect(state).toEqual(initialBoostsState);
  });

  it('should do nothing on rejected boosts list', () => {
    const action = { type: fetchBoostsByChainIdAction.rejected };
    const state = boostsSlice.reducer(initialBoostsState, action);
    expect(state).toEqual(initialBoostsState);
  });

  it('should update state on fulfilled boosts list', () => {
    const payload: FetchBoostsActionPayload = {
      chainId: 'harmony',
      boosts: [
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
    const action = { type: fetchBoostsByChainIdAction.fulfilled, payload: payload };
    const state = boostsSlice.reducer(initialBoostsState, action);
    expect(state).toMatchSnapshot();
  });
});
