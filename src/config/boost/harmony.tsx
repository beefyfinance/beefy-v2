export const pools = [
  {
    id: 'bifi-harmony',
    name: 'BIFI',
    logo: 'single-assets/BIFI.png',
    token: 'BIFI',
    tokenDecimals: 18,
    tokenAddress: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    tokenOracle: 'tokens',
    tokenOracleId: 'BIFI',
    earnedToken: 'WONE',
    earnedTokenDecimals: 18,
    earnedTokenAddress: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
    earnContractAddress: '0x5B96bbAca98D777cb736dd89A519015315E00D02',
    earnedOracle: 'tokens',
    earnedOracleId: 'WONE',
    partnership: false,
    status: 'active',
    fixedStatus: true,
    partners: [
      {
        logo: 'stake/beefy/beefyfinance.png',
        background: 'stake/beefy/background.png',
        text: "Beefy Finance is The Multi-Chain Yield Optimizer across many blockchains, enabling users to earn autocompounded yield on their crypto. Did you know also that you can own a piece of Beefy itself? Beefy runs on its governance token, BIFI. The token has a set supply of 80,000 across all chains; no more may be minted, ever! As a holder of BIFI you may create and vote on important DAO proposals, and you become dividend-eligible to earn a share of every compounding harvest on Beefy vaults, hour by hour. Here on Harmony, you just need to stake BIFI in this reward pool, or in the autocompounding BIFI Maxi vault on the main page. For this pool, ONE dividends are gathered and sent proportionally to each staker. Stake here, return later to claim the ONE you've earned.",
        website: 'https://app.beefy.finance',
        social: {
          telegram: 'http://t.me/beefyfinance',
          twitter: 'https://twitter.com/beefyfinance',
        },
      },
    ],
  },
];
