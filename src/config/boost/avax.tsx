const beefy = {
  logo: "stake/beefy/beefyfinance.png",
  logoNight: "stake/beefy/beefyfinance_night.png",
  background: "stake/beefy/background.png",
  text: "Beefy Finance is The Multi-Chain Yield Optimizer across many blockchains, enabling users to earn autocompounded yield on their crypto. Did you know also that you can own a piece of Beefy itself? Beefy runs on its governance token, BIFI. The token has a set supply of 80,000 across all chains; no more may be minted, ever! As a holder of BIFI you may create and vote on important DAO proposals, and you become dividend-eligible to earn a share of every compounding harvest on Beefy vaults, hour by hour. Here on Avalanche, you just need to stake BIFI in this reward pool, or in the autocompounding BIFI Maxi vault on the main page. For this pool, AVAX dividends are gathered and sent proportionally to each staker. Stake here, return later to claim the AVAX you've earned.",
  website: "https://app.beefy.finance",
  social: {
    telegram: "http://t.me/beefyfinance",
    twitter: "https://twitter.com/beefyfinance"
  }
};


export const pools = [
  {
    id: "moo_bifi_avax-singular",
    poolId: "joe-wavax-bifi-eol",
    name: "Singular",
    assets: [
      "BIFI",
      "AVAX"
    ],
    earnedToken: "SING",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xF9A075C9647e91410bF6C402bDF166e1540f67F0",
    earnContractAddress: "0x2554216fD346ABDBD59cc6f7E85A3fdAF15c1419",
    earnedOracle: "tokens",
    earnedOracleId: "SING",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/singular/logo.png",
        background: "stake/singular/bg.png",
        text: "The next gen multichain strategic yield farm on Polygon (Matic Network), Binance Smart Chain (BSC), and Avalanche with a unique Triple Farming System.",
        website: "https://singular.farm/",
        social: {
          telegram: "https://t.me/singularfarm",
          twitter: "https://twitter.com/singularfarm"
        }
      }
    ]
  },
  {
    id: "moo_joe-bifi",
    poolId: "joe-joe",
    name: "Beefy",
    logo: "single-assets/JOE.png",
    earnedToken: "mooAvalancheBIFI",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xCeefB07Ad37ff165A0b03DC7C808fD2E2fC77683",
    earnContractAddress: "0x90e91cAf13F6C06fD04031cF5f398F8b3BAB794B",
    earnedOracle: "tokens",
    earnedOracleId: "BIFI",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      beefy
    ]
  },
  {
    id: "moo_AVAX-grape",
    poolId: "aave-wavax",
    name: "Grape Finance",
    logo: "single-assets/AVAX.svg",
    earnedToken: "WINE",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xC55036B5348CfB45a932481744645985010d3A44",
    earnContractAddress: "0xE1BBde90EB564c5f26dfcDeB9918BDA183BF4e2b",
    earnedOracle: "tokens",
    earnedOracleId: "WINE",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/grape/logo.png",
        background: "stake/grape/bg.png",
        text: "Supporting the only pegged algorithmic stable currency currently on AVAX, $GRAPE which is pegged to $MIM. The goal is to create a DAO run by the community offering a high yield for investors and utilize two tokens $GRAPE and $WINE to bootstrap liquidity and provide funding for the extensive roadmap. An extensive roadmap including Launchpad, great partnerships, and upcoming lending protocol/new stable reserve currency. Future goals to support multiple chains and create a total defi ecosystem under the GrapeFi umbrella.",
        website: "https://grapefinance.app/",
        social: {
          telegram: "https://discord.gg/mZ4QrZwH5M",
          twitter: "https://twitter.com/grape_finance"
        }
      }
    ]
  }
];