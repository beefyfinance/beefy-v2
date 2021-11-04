export const pools = [
  {
    id: 'bifi-ht',
    name: 'BIFI',
    logo: 'single-assets/BIFI.png',
    token: 'BIFI',
    tokenDecimals: 18,
    tokenAddress: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    tokenOracle: 'tokens',
    tokenOracleId: 'BIFI',
    earnedToken: 'HT',
    earnedTokenDecimals: 18,
    earnedTokenAddress: '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
    earnContractAddress: '0x5f7347fedfD0b374e8CE8ed19Fc839F59FB59a3B',
    earnedOracle: 'tokens',
    earnedOracleId: 'WHT',
    partnership: false,
    status: 'active',
    fixedStatus: true,
    partners: [
      {
        logo: 'stake/beefy/beefyfinance.png',
        background: 'stake/beefy/background.png',
        text: "Beefy Finance is The Multi-Chain Yield Optimizer across many blockchains, enabling users to earn autocompounded yield on their crypto. Did you know also that you can own a piece of Beefy itself? Beefy runs on its governance token, BIFI. The token has a set supply of 80,000 across all chains; no more may be minted, ever! As a holder of BIFI you may create and vote on important DAO proposals, and you become dividend-eligible to earn a share of every compounding harvest on Beefy vaults, hour by hour. Here on HECO, you just need to stake BIFI in this reward pool, or in the autocompounding BIFI Maxi vault on the main page. For this pool, HT dividends are gathered and sent proportionally to each staker. Stake here, return later to claim the HT you've earned.",
        website: 'https://app.beefy.finance',
        social: {
          telegram: 'http://t.me/beefyfinance',
          twitter: 'https://twitter.com/beefyfinance',
        },
      },
    ],
  },
];
