import { govPoolABI } from '../beefy-app/src/featues/configure/abi';
//import { govPoolABI } from './src/featues/configure/abi';

const moonpot = {
  logo: 'stake/moonpot/logo.png',
  background: 'stake/moonpot/bg.png',
  text: 'Moonpot is a win-win savings game on Binance Smart Chain powered by Beefy Finance. By depositing crypto into a Moonpot, users gain interest on their assets and enter into a prize draw at the same time. There’s a chance to win weekly prizes paid out in crypto from each Moonpot entered — as well as an exclusive monthly prize draw for $POTS stakers.',
  website: 'https://moonpot.com/',
  social: {
    telegram: 'https://t.me/moonpotdotcom',
    twitter: 'https://twitter.com/moonpotdotcom',
  },
};
const ceek = {
  logo: 'stake/ceek/logo.png',
  background: 'stake/ceek/bg.png',
  text: 'CEEK (CEEK) is a decentralized platform featuring global superstars like Lady Gaga, Katy Perry, Ziggy Marley, Bon Jovi, UFC Champion Francis Ngannou, 3x NBA Champion Dwyane Wade and more. CEEK enables music artists, sports athletes and digital content creators to directly connect with their fans. CEEK tracks digital media assets on the blockchain, and makes fast, efficient secure payments for entertainment and education via smart contracts.',
  website: 'https://www.ceek.io/',
  social: {
    telegram: 'https://t.me/ceekvrtokensale',
    twitter: 'https://twitter.com/ceek',
  },
};
const nfty = {
  logo: 'stake/nfty/logo.png',
  background: 'stake/nfty/bg.png',
  text: 'NFTYLabs envisions a world where NFTs function as a medium of access, bringing a means of utility and privilege to NFT holders in a secure and confidential manner. NFTY will act as a cross-chain and interoperable bridge between enterprise, private content, and VIP communities; further strengthening the bond in ways never before imagined.',
  website: 'https://nftynetwork.io/',
  social: {
    telegram: 'https://t.me/NFTYNetwork',
    twitter: 'https://twitter.com/NFTYNetwork',
  },
};

export const bscStakePools = [
  {
    id: 'bifi-bnb',
    name: 'BIFI',
    logo: 'single-assets/BIFI.png',
    token: 'BIFI',
    tokenDecimals: 18,
    tokenAddress: '0xCa3F508B8e4Dd382eE878A314789373D80A5190A',
    tokenOracle: 'tokens',
    tokenOracleId: 'BIFI',
    earnedToken: 'BNB',
    earnedTokenDecimals: 18,
    earnedTokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    earnContractAddress: '0x453D4Ba9a2D594314DF88564248497F7D74d6b2C',
    earnContractAbi: govPoolABI,
    earnedOracle: 'tokens',
    earnedOracleId: 'WBNB',
    partnership: false,
    status: 'active',
    fixedStatus: true,
    partners: [
      {
        logo: 'stake/beefy/beefyfinance.png',
        logoNight: 'stake/beefy/beefyfinance_night.png',
        background: 'stake/beefy/background.png',
        text: "Beefy Finance is The Multi-Chain Yield Optimizer across many blockchains, enabling users to earn autocompounded yield on their crypto. Did you know also that you can own a piece of Beefy itself? Beefy runs on its governance token, BIFI. The token has a set supply of 80,000 across all chains; no more may be minted, ever! As a holder of BIFI you may create and vote on important DAO proposals, and you become dividend-eligible to earn a share of every compounding harvest on Beefy vaults, hour by hour. Here on Binance, you just need to stake BIFI in this reward pool, or in the autocompounding BIFI Maxi vault on the main page. For this pool, BNB dividends are gathered and sent proportionally to each staker. Stake here, return later to claim the BNB you've earned.",
        website: 'https://app.beefy.finance',
        social: {
          telegram: 'http://t.me/beefyfinance',
          twitter: 'https://twitter.com/beefyfinance',
        },
      },
    ],
  },
  {
    id: 'moo_alpaca-ibalpaca-nfty',
    name: 'NFTY',
    logo: 'single-assets/ALPACA.png',
    token: 'mooIbAlpaca',
    tokenDecimals: 18,
    tokenAddress: '0x6EB4F8975b15F34AdccFDE830087Fc8FdB006C36',
    tokenOracle: 'lps',
    tokenOracleId: 'alpaca-ibalpaca',
    earnedToken: 'mooNfty',
    earnedTokenDecimals: 18,
    earnedTokenAddress: '0x55669f1c00D55F55bA1E736A23cEE54877D922Be',
    earnContractAddress: '0xF9353488011a4b10e31656B68684bEc6Cfadf2b7',
    earnContractAbi: govPoolABI,
    earnedOracle: 'tokens',
    earnedOracleId: 'NFTY',
    partnership: true,
    status: 'active',
    isMooStaked: true,
    periodFinish: 1638011380,
    partners: [nfty]
  }
];
