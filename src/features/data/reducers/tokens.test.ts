import { fetchVaultByChainIdAction, FulfilledPayload } from '../actions/vaults';
import { tokensSlice, initialTokensState } from './tokens';

describe('Tokens slice tests', () => {
  it('should do nothing on pending vault list', () => {
    const action = { type: fetchVaultByChainIdAction.pending };
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toEqual(initialTokensState);
  });

  it('should do nothing on rejected vault list', () => {
    const action = { type: fetchVaultByChainIdAction.rejected };
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toEqual(initialTokensState);
  });

  it('should update state on fulfilled vault list', () => {
    const payload: FulfilledPayload = {
      chainId: 'harmony',
      pools: [
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
          poolAddress: '0x5b96bbaca98d777cb736dd89a519015315e00d02',
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
    };
    const action = { type: fetchVaultByChainIdAction.fulfilled, payload: payload };
    const state = tokensSlice.reducer(initialTokensState, action);
    expect(state).toMatchSnapshot();
  });
});
