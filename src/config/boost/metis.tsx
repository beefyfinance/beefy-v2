export const pools = [
  {
    id: 'moo_netswap-wbtc-metis-relay',
    poolId: 'netswap-wbtc-metis',
    name: 'Relay Chain - Metis',
    assets: ['WBTC', 'METIS'],
    earnedToken: 'Metis',
    earnedTokenDecimals: 18,
    earnedTokenAddress: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
    earnContractAddress: '0xeD4ea30c755676C07d3e0e0f74Ff84C0193B4551',
    earnedOracle: 'tokens',
    earnedOracleId: 'METIS',
    partnership: true,
    status: 'active',
    isMooStaked: true,
    partners: [
      {
        logo: 'stake/relay/logo.png',
        background: 'stake/relay/bg.png',
        text: 'Thanks to Metis’ close partnership with Relay Chain, the wrapped version of the largest and longest-running cryptocurrency is now available throughout the Andromeda network. To celebrate this partnership we are boosting this vault with extra $METIS tokens on top.',
        website: 'https://app.relaychain.com/#/cross-chain-bridge-transfer',
        social: {
          telegram: 'https://t.me/relaychaincommunity',
          twitter: 'https://twitter.com/relay_chain',
        },
      },
    ],
  },
];
