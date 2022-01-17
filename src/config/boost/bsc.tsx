const nfty = {
  logo: "stake/nfty/logo.png",
  background: "stake/nfty/bg.png",
  text: "NFTYLabs envisions a world where NFTs function as a medium of access, bringing a means of utility and privilege to NFT holders in a secure and confidential manner. NFTY will act as a cross-chain and interoperable bridge between enterprise, private content, and VIP communities; further strengthening the bond in ways never before imagined.",
  website: "https://nftynetwork.io/",
  social: {
    telegram: "https://t.me/NFTYNetwork",
    twitter: "https://twitter.com/NFTYNetwork"
  }
};

const mogul = {
  logo: "stake/mogul/logo.png",
  background: "stake/mogul/bg.png",
  text: "Mogul is an NFT and DeFi platform for film and entertainment, bridging Hollywood and blockchain technology. The STARS token powers the Mogul platform and offers rewards from movies. The Mogul platform has an NFT auction house, marketplace, and other products in the metaverse to bring movie fans closer to the action.",
  website: "https://www.mogulproductions.com/",
  social: {
    telegram: "https://t.me/mogulproductions",
    twitter: "https://twitter.com/mogulofficial_"
  }
};

const ceek = {
  logo: "stake/ceek/logo.png",
  background: "stake/ceek/bg.png",
  text: "CEEK (CEEK) is a decentralized platform featuring global superstars like Lady Gaga, Katy Perry, Ziggy Marley, Bon Jovi, UFC Champion Francis Ngannou, 3x NBA Champion Dwyane Wade and more. CEEK enables music artists, sports athletes and digital content creators to directly connect with their fans. CEEK tracks digital media assets on the blockchain, and makes fast, efficient secure payments for entertainment and education via smart contracts.",
  website: "https://www.ceek.io/",
  social: {
    telegram: "https://t.me/ceekvrtokensale",
    twitter: "https://twitter.com/ceek"
  }
};

const moonpot = {
  logo: "stake/moonpot/logo.png",
  background: "stake/moonpot/bg.png",
  text: "Moonpot is a win-win savings game on Binance Smart Chain powered by Beefy Finance. By depositing crypto into a Moonpot, users gain interest on their assets and enter into a prize draw at the same time. There’s a chance to win weekly prizes paid out in crypto from each Moonpot entered — as well as an exclusive monthly prize draw for $POTS stakers.",
  website: "https://moonpot.com/",
  social: {
    telegram: "https://t.me/moonpotdotcom",
    twitter: "https://twitter.com/moonpotdotcom"
  }
};


export const pools = [
  {
    id: "moo_baby-usdt-milk-babyswap",
    poolId: "baby-usdt-milk",
    name: "BabySwap",
    assets: [
      "MILK",
      "USDT"
    ],
    earnedToken: "MILK",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xBf37f781473f3b50E82C668352984865eac9853f",
    earnContractAddress: "0x5ff90a4C704E65dc4aF232DE936583EeC738AB2f",
    earnedOracle: "tokens",
    earnedOracleId: "MILK",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/babyswap/logo.png",
        background: "stake/babyswap/bg.png",
        text: "The Crypto You is the first Baby Metaverse blockchain game on Binance Smart Chain (BSC). Players can summon characters, complete daily mining missions, conquer the Dark Force, loot rare items to play and earn.",
        website: "https://home.babyswap.finance/",
        social: {
          telegram: "https://t.me/baby_swap",
          twitter: "https://twitter.com/babyswap_bsc"
        }
      }
    ]
  },
  {
    id: "moo_banana-banana-busd-bitcrush",
    poolId: "banana-banana-busd",
    name: "Bitcrush",
    logo: "degens/banana-busd.svg",
    earnedToken: "CRUSH",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x0Ef0626736c2d484A792508e99949736D0AF807e",
    earnContractAddress: "0xe6bC48Ce41af28238E726AeeCDAFeB4337b02216",
    earnedOracle: "tokens",
    earnedOracleId: "CRUSH",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/bitcrush/logo.png",
        background: "stake/bitcrush/bg.png",
        text: "Bitcrush uses a hybrid approach that allows centralized gameplay utilizing a non-custodial live wallet. When you add funds to the live wallet to play, those are still your funds. It's a delicate back and forth dance between the super-quick server and the slow blockchain. It’s a Win/Win/Win platform where we have a single asset staking pool that rewards in both APY + Casino profits and its auto-compounding.",
        website: "https://www.bitcrush.com/",
        social: {
          telegram: "https://t.me/Bcarcadechat",
          twitter: "https://twitter.com/bitcrusharcade"
        }
      }
    ]
  },
  {
    id: "moo_banana-crush-wbnb-bitcrush",
    poolId: "banana-crush-wbnb",
    name: "Bitcrush",
    assets: [
      "CRUSH",
      "BNB"
    ],
    earnedToken: "CRUSH",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x0Ef0626736c2d484A792508e99949736D0AF807e",
    earnContractAddress: "0xB726d9a71Ee0538b68102c782C667b1b6dE48789",
    earnedOracle: "tokens",
    earnedOracleId: "CRUSH",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/bitcrush/logo.png",
        background: "stake/bitcrush/bg.png",
        text: "Bitcrush uses a hybrid approach that allows centralized gameplay utilizing a non-custodial live wallet. When you add funds to the live wallet to play, those are still your funds. It's a delicate back and forth dance between the super-quick server and the slow blockchain. It’s a Win/Win/Win platform where we have a single asset staking pool that rewards in both APY + Casino profits and its auto-compounding.",
        website: "https://www.bitcrush.com/",
        social: {
          telegram: "https://t.me/Bcarcadechat",
          twitter: "https://twitter.com/bitcrusharcade"
        }
      }
    ]
  },
  {
    id: "moo_banana-nfty-wbnb-nfty-3",
    poolId: "banana-nfty-wbnb",
    name: "NFTY",
    assets: [
      "NFTY",
      "BNB"
    ],
    earnedToken: "mooNfty",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x55669f1c00D55F55bA1E736A23cEE54877D922Be",
    earnContractAddress: "0x112869FEd3E3C88c08527EA104E7C9d98efe7AF0",
    earnedOracle: "tokens",
    earnedOracleId: "mooNfty",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      nfty
    ]
  },
  {
    id: "moo_ellipsis-renbtc-charge",
    poolId: "ellipsis-renbtc",
    name: "ChargeDeFi",
    logo: "uncategorized/epsRENBTC.png",
    earnedToken: "Charge",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x1C6bc8e962427dEb4106aE06A7fA2d715687395c",
    earnContractAddress: "0xC80764dE9c59E764fFF1e5bDad47dD1a1B774543",
    earnedOracle: "tokens",
    earnedOracleId: "CHARGE",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/charge/logo.png",
        background: "stake/charge/bg.png",
        text: "ChargeDeFi is a new platform launching on BSC combining a traditional Algorithmic Stablecoin (pegged to $1.0 BUSD) with rebase mechanics. Featuring an extensive ecosystem of smart reinvestment pools, bond pools that yield below peg and multiple boardroom options ChargeDeFi enters BSC with a large set of investment options. Initially launching on BSC the next step will be multichain.",
        website: "https://bit.ly/32NB1tP",
        social: {
          telegram: "https://t.me/chargedefi",
          twitter: "https://twitter.com/ChargeDeFi"
        }
      }
    ]
  },
  {
    id: "moo_banana-bnb-stars-mogul2",
    poolId: "banana-bnb-stars",
    name: "Mogul",
    assets: [
      "STARS",
      "BNB"
    ],
    earnedToken: "STARS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xbD83010eB60F12112908774998F65761cf9f6f9a",
    earnContractAddress: "0xbCcDCD99d395Ce3F1FcbC9aB40bCfcce2a1894e6",
    earnedOracle: "tokens",
    earnedOracleId: "STARS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      mogul
    ]
  },
  {
    id: "moo_1INCH-blockmine",
    poolId: "1inch-1inch-eol",
    name: "BlockMine",
    logo: "single-assets/INCH.png",
    earnedToken: "NUGGET",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xE0B58022487131eC9913C1F3AcFD8F74FC6A6C7E",
    earnContractAddress: "0x6e3C65E24e9AF2f7C63Ab0a205aF314f3325b678",
    earnedOracle: "tokens",
    earnedOracleId: "NUGGET",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/blockmine/logo.png",
        background: "stake/blockmine/bg.png",
        text: "Blockmine is aiming to create the most sustainable farming ecosystem in the DeFi space by providing an unique token evolution. Stop coffee boilin' and get out of the saloon - it's time to gitty up and make some juicy GOLDNUGGETS.",
        website: "https://block-mine.io/",
        social: {
          telegram: "https://t.me/blockmine_io",
          twitter: "https://twitter.com/blockmine_io"
        }
      }
    ]
  },
  {
    id: "moo_BANANA-bishares",
    poolId: "banana-bananav2",
    name: "BiShares",
    logo: "degens/BANANA.svg",
    earnedToken: "BISON",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x19A6Da6e382b85F827088092a3DBe864d9cCba73",
    earnContractAddress: "0xa9b758AF585cc4262B2ed9C774eDb78eCe017BCB",
    earnedOracle: "tokens",
    earnedOracleId: "BISON",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/bishares/logo.png",
        background: "stake/bishares/bg.png",
        text: "Decentralized Exchange Traded Funds (dETFs) for safe crypto diversification & yield farming. BiShares offers Yield Bearing Funds both in stable coins and LP's that auto compound and take the best average yields across multiple platforms. Their selection of funds will cover all your bases from blue-chip to FOMO tokens.",
        website: "https://bishares.finance/",
        social: {
          telegram: "https://t.me/bishares",
          twitter: "https://twitter.com/BiSharesFinance"
        }
      }
    ]
  },
  {
    id: "moo_bison-bison-wbnb-bishares",
    poolId: "bison-bison-bnb",
    name: "BiShares",
    assets: [
      "BISON",
      "BNB"
    ],
    earnedToken: "BISON",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x19A6Da6e382b85F827088092a3DBe864d9cCba73",
    earnContractAddress: "0xF3787668fd04EA5B78724a509522a11613B6119f",
    earnedOracle: "tokens",
    earnedOracleId: "BISON",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/bishares/logo.png",
        background: "stake/bishares/bg.png",
        text: "Decentralized Exchange Traded Funds (dETFs) for safe crypto diversification & yield farming. BiShares offers Yield Bearing Funds both in stable coins and LP's that auto compound and take the best average yields across multiple platforms. Their selection of funds will cover all your bases from blue-chip to FOMO tokens.",
        website: "https://bishares.finance/",
        social: {
          telegram: "https://t.me/bishares",
          twitter: "https://twitter.com/BiSharesFinance"
        }
      }
    ]
  },
  {
    id: "moo_belt-beltbtc-betu",
    poolId: "belt-beltbtc",
    name: "BETU",
    logo: "single-assets/BTCB.svg",
    earnedToken: "mooBetu",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x22b3d90BDdC3Ad5F2948bE3914255C64Ebc8c9b3",
    earnContractAddress: "0x19b042f5c22292fd8B166477100B13Cb1c9b4A65",
    earnedOracle: "tokens",
    earnedOracleId: "BETU",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/betu/logo.png",
        background: "stake/betu/bg.png",
        text: "BetU is here to revolutionize both the gambling and gaming industries. From traditional sports to e-sports, you can now place bets on BetU’s Fantasy league and earn up to $10,000 in crypto rewards every week! No risk, real rewards. Play now at play.betufantasy.com",
        website: "https://betu.io/",
        social: {
          telegram: "https://t.me/betucommunity",
          twitter: "https://twitter.com/betuglobal"
        }
      }
    ]
  },
  {
    id: "moo_banana-oasis-wbnb-oasis",
    poolId: "banana-oasis-wbnb",
    name: "Oasis",
    assets: [
      "OASIS",
      "BNB"
    ],
    earnedToken: "OASIS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xb19289b436b2F7A92891ac391D8f52580d3087e4",
    earnContractAddress: "0x8D6697388dfC5D18ed9cc5118a67b2A192A4737d",
    earnedOracle: "tokens",
    earnedOracleId: "OASIS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/oasis/logo.png",
        background: "stake/oasis/bg.png",
        text: "ProjectOasis is a metaverse built for users to socialize and interact with various Decentralized applications (Dapps) and protocols available within Decentralized Finance (DeFi). The Oasis universe consists of token swaps (AMMs), farming and staking pools, launchpads, and NFT marketplaces. It includes a Participate-to-Earn element where users are rewarded for their interactions within the metaverse.",
        website: "https://projectoasis.io/",
        social: {
          telegram: "https://t.me/projectoasis_official",
          twitter: "https://twitter.com/ProjectOasis_"
        }
      }
    ]
  },
  {
    id: "moo_banana-banana-bnb-oasis",
    poolId: "banana-banana-bnb",
    name: "Oasis",
    logo: "degens/banana-bnb.svg",
    earnedToken: "OASIS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xb19289b436b2F7A92891ac391D8f52580d3087e4",
    earnContractAddress: "0x04883d74392112E04A345fa01D72F37b1f94456B",
    earnedOracle: "tokens",
    earnedOracleId: "OASIS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/oasis/logo.png",
        background: "stake/oasis/bg.png",
        text: "ProjectOasis is a metaverse built for users to socialize and interact with various Decentralized applications (Dapps) and protocols available within Decentralized Finance (DeFi). The Oasis universe consists of token swaps (AMMs), farming and staking pools, launchpads, and NFT marketplaces. It includes a Participate-to-Earn element where users are rewarded for their interactions within the metaverse.",
        website: "https://projectoasis.io/",
        social: {
          telegram: "https://t.me/projectoasis_official",
          twitter: "https://twitter.com/ProjectOasis_"
        }
      }
    ]
  },
  {
    id: "moo_alpaca-ibalpaca-nfty",
    poolId: "alpaca-ibalpaca-eol",
    name: "NFTY",
    logo: "single-assets/ALPACA.png",
    earnedToken: "mooNfty",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x55669f1c00D55F55bA1E736A23cEE54877D922Be",
    earnContractAddress: "0xF9353488011a4b10e31656B68684bEc6Cfadf2b7",
    earnedOracle: "tokens",
    earnedOracleId: "NFTY",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      nfty
    ]
  },
  {
    id: "moo_banana-nfty-wbnb-nfty-2",
    poolId: "banana-nfty-wbnb",
    name: "NFTY",
    assets: [
      "NFTY",
      "BNB"
    ],
    earnedToken: "mooNfty",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x55669f1c00D55F55bA1E736A23cEE54877D922Be",
    earnContractAddress: "0xA79CC48b4968ADF1B06eB1b6395EFb786Ab5445C",
    earnedOracle: "tokens",
    earnedOracleId: "NFTY",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      nfty
    ]
  },
  {
    id: "moo_banana-bnb-stars-mogul",
    poolId: "banana-bnb-stars",
    name: "Mogul",
    assets: [
      "STARS",
      "BNB"
    ],
    earnedToken: "STARS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xbD83010eB60F12112908774998F65761cf9f6f9a",
    earnContractAddress: "0xe2fbB4A510d0E290d8B8533b0136Dc1Fe603e946",
    earnedOracle: "tokens",
    earnedOracleId: "STARS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      mogul
    ]
  },
  {
    id: "moo_banana-wbnb-ceek-ceek-2",
    poolId: "banana-wbnb-ceek",
    name: "CEEK",
    assets: [
      "CEEK",
      "BNB"
    ],
    earnedToken: "CEEK",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xe0F94Ac5462997D2BC57287Ac3a3aE4C31345D66",
    earnContractAddress: "0x9ba849C8b9FD8D4f04c6b22557553195f3a02870",
    earnedOracle: "tokens",
    earnedOracleId: "CEEK",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      ceek
    ]
  },
  {
    id: "moo_banana-banana-bnb-ceek",
    poolId: "banana-banana-bnb",
    name: "CEEK",
    logo: "degens/banana-bnb.svg",
    earnedToken: "CEEK",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xe0F94Ac5462997D2BC57287Ac3a3aE4C31345D66",
    earnContractAddress: "0x6EA8849E656Fb6cf357681ECe6165F2c4BACB038",
    earnedOracle: "tokens",
    earnedOracleId: "CEEK",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      ceek
    ]
  },
  {
    id: "moo_ellipsis-renbtc-gamexchange",
    poolId: "ellipsis-renbtc",
    name: "Game X Change",
    logo: "uncategorized/epsRENBTC.png",
    earnedToken: "EXP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x639d4C62F58a4048AD0F69B8CE675dB1A3e8e00e",
    earnContractAddress: "0x4298Ff137C8F583F530ea241da3Da6a6AA66dAEb",
    earnedOracle: "tokens",
    earnedOracleId: "EXP",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/gamexchange/logo.png",
        background: "stake/gamexchange/bg.png",
        text: "Game X Change is a gaming platform where users can move assets (virtual cash and NFTs) from one platform, game, or blockchain to another, in a safe and controlled way. Play & earn and convert in-game currencies and NFTs from game to game! Game X Change offers rewards for playing, earning, and farming across the platform through its native utility token, $EXP. Through the use of Game X Change’s technology solutions stack, developers are provided with a full suite of tools to innovate and integrate both legacy and blockchain games. Game X Change is the future of game asset exchange.",
        website: "https://gamexchange.app/",
        social: {
          telegram: "https://t.me/GameXChange",
          twitter: "https://twitter.com/GameX_Change"
        }
      }
    ]
  },
  {
    id: "moo_banana-exp-wbnb-gamexchange",
    poolId: "banana-exp-wbnb-eol",
    name: "Game X Change",
    assets: [
      "EXP",
      "BNB"
    ],
    earnedToken: "EXP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x639d4C62F58a4048AD0F69B8CE675dB1A3e8e00e",
    earnContractAddress: "0x522ceA0bc3EEb3c6B35f12662326F2b8d5Fb69e3",
    earnedOracle: "tokens",
    earnedOracleId: "EXP",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/gamexchange/logo.png",
        background: "stake/gamexchange/bg.png",
        text: "Game X Change is a gaming platform where users can move assets (virtual cash and NFTs) from one platform, game, or blockchain to another, in a safe and controlled way. Play & earn and convert in-game currencies and NFTs from game to game! Game X Change offers rewards for playing, earning, and farming across the platform through its native utility token, $EXP. Through the use of Game X Change’s technology solutions stack, developers are provided with a full suite of tools to innovate and integrate both legacy and blockchain games. Game X Change is the future of game asset exchange.",
        website: "https://gamexchange.app/",
        social: {
          telegram: "https://t.me/GameXChange",
          twitter: "https://twitter.com/GameX_Change"
        }
      }
    ]
  },
  {
    id: "moo_belt-beltbtc-wsg",
    poolId: "belt-beltbtc",
    name: "WallStreetGames",
    logo: "single-assets/BTCB.svg",
    earnedToken: "MooWSG",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xf6581Be77F4933FDcf92C9E0D49e7f85e5360705",
    earnContractAddress: "0xAD02D935D7BDAEa0ba3227Fe160856be78b782Cf",
    earnedOracle: "tokens",
    earnedOracleId: "WSG",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/wsg/logo.png",
        background: "stake/wsg/bg.png",
        text: "Wall Street Games is a next-generation hybrid blockchain-based online gaming platform, where players can earn cryptocurrencies by playing fun & addictive games, collect tradable NFTs and win rewards!",
        website: "https://stake.wallstreetgames.net/",
        social: {
          telegram: "https://t.me/WSGToken",
          twitter: "https://twitter.com/WSGToken"
        }
      }
    ]
  },
  {
    id: "moo_banana-banana-bnb-playmining",
    poolId: "banana-banana-bnb",
    name: "PlayMining",
    logo: "degens/banana-bnb.svg",
    earnedToken: "DEP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xcaF5191fc480F43e4DF80106c7695ECA56E48B18",
    earnContractAddress: "0x849F856f54C7b45e574300E9B7834B96F62a5166",
    earnedOracle: "tokens",
    earnedOracleId: "DEP",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/dep/logo.png",
        background: "stake/dep/bg.png",
        text: "Playmining is a new form of income that rewards you through adventure and exploration. A platform that creates a society that is free from occupation and environment by exchanging one’s passions among those who create fun and those who share the fun.",
        website: "https://playmining.com/?locale=en",
        social: {
          telegram: "https://t.me/DEAPcoin_group",
          twitter: "https://twitter.com/PlayMining_SG"
        }
      }
    ]
  },
  {
    id: "moo_BANANA-ceek",
    poolId: "banana-bananav2",
    name: "CEEK",
    logo: "degens/BANANA.svg",
    earnedToken: "CEEK",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xe0F94Ac5462997D2BC57287Ac3a3aE4C31345D66",
    earnContractAddress: "0x260aAC1fCc624dF1F3CeB752f1F77538053565bf",
    earnedOracle: "tokens",
    earnedOracleId: "CEEK",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/ceek/logo.png",
        background: "stake/ceek/bg.png",
        text: "CEEK (CEEK) is a decentralized platform featuring global superstars like Lady Gaga, Katy Perry, Ziggy Marley, Bon Jovi, UFC Champion Francis Ngannou, 3x NBA Champion Dwyane Wade and more. CEEK enables music artists, sports athletes and digital content creators to directly connect with their fans. CEEK tracks digital media assets on the blockchain, and makes fast, efficient secure payments for entertainment and education via smart contracts.",
        website: "https://www.ceek.io/",
        social: {
          telegram: "https://t.me/ceekvrtokensale",
          twitter: "https://twitter.com/ceek"
        }
      }
    ]
  },
  {
    id: "moo_banana-wbnb-ceek-ceek",
    poolId: "banana-wbnb-ceek",
    name: "CEEK",
    assets: [
      "CEEK",
      "BNB"
    ],
    earnedToken: "CEEK",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xe0F94Ac5462997D2BC57287Ac3a3aE4C31345D66",
    earnContractAddress: "0xb6fC871229CA8D44AAa0AD01Ef61320b9b103F3E",
    earnedOracle: "tokens",
    earnedOracleId: "CEEK",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/ceek/logo.png",
        background: "stake/ceek/bg.png",
        text: "CEEK (CEEK) is a decentralized platform featuring global superstars like Lady Gaga, Katy Perry, Ziggy Marley, Bon Jovi, UFC Champion Francis Ngannou, 3x NBA Champion Dwyane Wade and more. CEEK enables music artists, sports athletes and digital content creators to directly connect with their fans. CEEK tracks digital media assets on the blockchain, and makes fast, efficient secure payments for entertainment and education via smart contracts.",
        website: "https://www.ceek.io/",
        social: {
          telegram: "https://t.me/ceekvrtokensale",
          twitter: "https://twitter.com/ceek"
        }
      }
    ]
  },
  {
    id: "moo_belt-beltbnb-babyswap",
    poolId: "belt-beltbnb",
    name: "BabySwap",
    logo: "single-assets/BNB.png",
    earnedToken: "mooBaby",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x87F9A89B51dA28CE8653A700d362CDa9b9bA7d88",
    earnContractAddress: "0x2d75b722c43e9cf57640909bF0a79cFC9f0bf800",
    earnedOracle: "tokens",
    earnedOracleId: "BABY",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/babyswap/logo.png",
        background: "stake/babyswap/bg.png",
        text: "BabySwap is an AMM+NFT decentralized exchange for newborn projects on Binance Smart Chain, providing a more friendly trading experience and better project support. Audited by Certik!",
        website: "https://home.babyswap.finance/",
        social: {
          telegram: "https://t.me/baby_swap",
          twitter: "https://twitter.com/babyswap_bsc"
        }
      }
    ]
  },
  {
    id: "moo_belt-belteth-nfty",
    poolId: "belt-belteth",
    name: "NFTY",
    logo: "single-assets/ETH.svg",
    earnedToken: "NFTY",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x5774B2fc3e91aF89f89141EacF76545e74265982",
    earnContractAddress: "0x804f23055DE069cB80a8590f96a5b7367b710d14",
    earnedOracle: "tokens",
    earnedOracleId: "NFTY",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/nfty/logo.png",
        background: "stake/nfty/bg.png",
        text: "NFTYLabs envisions a world where NFTs function as a medium of access, bringing a means of utility and privilege to NFT holders in a secure and confidential manner. NFTY will act as a cross-chain and interoperable bridge between enterprise, private content, and VIP communities; further strengthening the bond in ways never before imagined.",
        website: "https://nftynetwork.io/",
        social: {
          telegram: "https://t.me/NFTYNetwork",
          twitter: "https://twitter.com/NFTYNetwork"
        }
      }
    ]
  },
  {
    id: "moo_banana-nfty-wbnb-nfty",
    poolId: "banana-nfty-wbnb",
    name: "NFTY",
    assets: [
      "NFTY",
      "BNB"
    ],
    earnedToken: "NFTY",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x5774B2fc3e91aF89f89141EacF76545e74265982",
    earnContractAddress: "0x0355dcA72d92E4fACDa3DaAdFCf142E04E4d6633",
    earnedOracle: "tokens",
    earnedOracleId: "NFTY",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/nfty/logo.png",
        background: "stake/nfty/bg.png",
        text: "NFTYLabs envisions a world where NFTs function as a medium of access, bringing a means of utility and privilege to NFT holders in a secure and confidential manner. NFTY will act as a cross-chain and interoperable bridge between enterprise, private content, and VIP communities; further strengthening the bond in ways never before imagined.",
        website: "https://nftynetwork.io/",
        social: {
          telegram: "https://t.me/NFTYNetwork",
          twitter: "https://twitter.com/NFTYNetwork"
        }
      }
    ]
  },
  {
    id: "moo_bifi_bnb-cafeswap",
    poolId: "banana-bifi-bnb",
    name: "CafeSwap",
    logo: "degens/BIFI-BNB-banana.svg",
    earnedToken: "BREW",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x790Be81C3cA0e53974bE2688cDb954732C9862e1",
    earnContractAddress: "0xe3Ac77F805805bE7639D9576405D52dddCB5F431",
    earnedOracle: "tokens",
    earnedOracleId: "BREW",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/cafeswap/logo.png",
        background: "stake/cafeswap/bg.png",
        text: "CafeSwap is a yield farming and staking platform on BSC Chain and polygon. We have chosen BSC and Polygon because of its low tnx fees and faster speed. We have built this project to provide the best experience with farming while regulating the supply, We believe in partnerships hence we aim to bring all BSC and Polygon DeFi ecosystems in one place to have a friendly ecosystem for all of us.",
        website: "https://cafeswap.finance",
        social: {
          telegram: "https://t.me/CafeSwap",
          twitter: "https://twitter.com/cafeswapfinance"
        }
      }
    ]
  },
  {
    id: "moo_bifi_usdt-singular",
    poolId: "mdex-bsc-bifi-usdt",
    name: "Singular",
    assets: [
      "BIFI",
      "USDT"
    ],
    earnedToken: "SING",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x23894C0ce2d79B79Ea33A4D02e67ae843Ef6e563",
    earnContractAddress: "0x254A1D081CE07485856656FF6312619b95875De0",
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
    id: "moo_banana_bnb-pacoca",
    poolId: "banana-banana-bnb",
    name: "Pacoca",
    logo: "degens/banana-bnb.svg",
    earnedToken: "mooPacoca",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x21403739A1Dc0e3ceC70CBD5ceaE78fF25F102a4",
    earnContractAddress: "0x3B6D305FAe833A64E56B1A4067A959D285B4F238",
    earnedOracle: "tokens",
    earnedOracleId: "PACOCA",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/pacoca/logo.png",
        background: "stake/pacoca/bg.png",
        text: "Paçoca is a portfolio management that evolved into a full DeFi hub, where investors can track and invest in many projects from a single platform. The platform has 3 audits: CertiK, Inspex, and TechRate. Paçoca users can enjoy benefits such as high APY farms (CAKE APY of 150%+), daily buybacks of more than $16,000, and security upgrades such CertiK Skynet security intelligence engine.",
        website: "https://pacoca.io/",
        social: {
          telegram: "https://t.me/pacoca_io",
          twitter: "https://twitter.com/pacoca_io"
        }
      }
    ]
  },
  {
    id: "moo_beltbtc-annex",
    poolId: "belt-beltbtc",
    name: "Annex",
    logo: "single-assets/BTCB.svg",
    earnedToken: "mooAnnexAnn",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xB3e80cf1e9A0478F917Ec81f6B223C495CA20a27",
    earnContractAddress: "0x0172248F06Fc60a6c3F2760b83Da330E3c4AeE00",
    earnedOracle: "tokens",
    earnedOracleId: "ANN",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/annex/logo.png",
        background: "stake/annex/bg.png",
        text: "A Decentralized Marketplace for Lenders and Borrowers with Borderless Stablecoins.",
        website: "https://annex.finance/",
        social: {
          telegram: "https://t.me/Annex_finance_group",
          twitter: "https://twitter.com/AnnexFinance"
        }
      }
    ]
  },
  {
    id: "moo_belteth-pearzap",
    poolId: "belt-belteth",
    name: "Pearzap",
    logo: "single-assets/BNB.png",
    earnedToken: "bPEAR",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xdf7C18ED59EA738070E665Ac3F5c258dcc2FBad8",
    earnContractAddress: "0xCd661f69f8059409dB08B185395a1B015ee9805A",
    earnedOracle: "tokens",
    earnedOracleId: "bPEAR",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/pearzap/logo.png",
        background: "stake/pearzap/bg.png",
        text: "PearZap Finance is a yield farming project on the Polygon Chain, born out of the idea of bringing consistency in high APR's and security to our investors through our $Pear native token. Join the PearZap family and be part of a project that prides itself in quality partnerships and delivering on the promises we make, no matter how juicy they may be. 🍐⚡️",
        website: "https://pearzap.com/",
        social: {
          telegram: "https://t.me/pearzap",
          twitter: "https://twitter.com/pearzap"
        }
      }
    ]
  },
  {
    id: "moo_beltbnb-czodiac",
    poolId: "belt-beltbnb",
    name: "Czodiac",
    logo: "single-assets/BNB.png",
    earnedToken: "CZF",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x7c1608c004f20c3520f70b924e2bfef092da0043",
    earnContractAddress: "0x5D774D57Fd635Cd4Bb6E556A4FFf45f288Effeb9",
    earnedOracle: "tokens",
    earnedOracleId: "CZF",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/czodiac/logo.png",
        background: "stake/czodiac/bg.png",
        text: "Chinese Zodiacs bring luck to those who truly believe. Many people around the global plan their life according to what these signs tell them. With CZodiac, you can win unique Zodiac themed NFTs, play games with your CZodiac tokens such as $OXZ and $TIGZ, earn with $CZF in farms and pools, borrow and earn with the $CZUSD stablecoin, and much more. Our community releases new Chinese Zodiac themed dapps with the latest defi and blockchain gaming technology with airdrops, giveaways, and other rewards to our holders.\n",
        website: "https://app.czodiac.com/",
        social: {
          telegram: "https://t.me/CZodiacofficial",
          twitter: "https://twitter.com/zodiacs_c"
        }
      }
    ]
  },
  {
    id: "moo_bifi-bnb-long",
    poolId: "banana-bifi-bnb",
    name: "LongDrink",
    logo: "degens/BIFI-BNB-banana.svg",
    earnedToken: "LONG",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x5317fa16f8603be9c461def5d5a1bf28dfe42d55",
    earnContractAddress: "0xB0E65F0B6b202a0bb46B9C929B33A23648dDAf10",
    earnedOracle: "tokens",
    earnedOracleId: "LONG",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/longdrink/logo.png",
        background: "stake/longdrink/bg.png",
        text: "Longdrink Finance is an index protocol for cryptocurrencies. Currently, it offers two index tokens, each containing multiple underlying assets. $BEV (Binance Ecosystem Value) captures the growth of the BSC Ecosystem by uniting ten of the biggest BSC-native projects in one token. $L1Q (Layer 1 Quality Index) gives investors exposure to the leading blockchain architecture, by combining eight of the major layer-1 solutions in one token. Thereby, Longdrink Finance offers investors easy diversification to a wide range of assets, outperforming individual project picks in the long-term (similar to how passive index funds outperform individual stock picks in TradFi). \n\nLongdrink Finance is community-governed, designed as a DAO of talented and unique individuals - of thinkers and tinkerers with a mission. \n\nThrough our community governance token $LONG, holders have exclusive voting rights and say in future protocol innovation.\n",
        website: "https://longdrink.finance/",
        social: {
          telegram: "https://t.me/longdrinkfinance",
          twitter: "https://twitter.com/LongdrinkDefi"
        }
      }
    ]
  },
  {
    id: "moo_belt_4belt-honeymoon",
    poolId: "belt-4belt",
    name: "HoneyFarm",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "MOON",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xE8c93310af068aa50bd7bF0ebFa459Df2a02ceba",
    earnContractAddress: "0x4Ae70db74264D78E2497f6cd7829A0eE217BCb69",
    earnedOracle: "tokens",
    earnedOracleId: "MOON",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/honey/logo.png",
        background: "stake/honey/bg.png",
        text: "HoneyFarm Finance is a layered delegated yield farming project with deflationary tokenomics of a maximum supply of 24,650 HONEY tokens. There will be multiple layered projects and each layer will also has pools with previous layers' native tokens. The whole project will be finished after the final emission of a certain layered project, which will be announced in advance.",
        website: "https://honeyfarm.finance/",
        social: {
          telegram: "https://t.me/HoneyFarmChat",
          twitter: "https://twitter.com/HoneyFarmFi"
        }
      }
    ]
  },
  {
    id: "moo_pots_busd-moonpot",
    poolId: "cakev2-pots-busd-eol",
    name: "Moonpot",
    assets: [
      "POTS",
      "BUSD"
    ],
    earnedToken: "POTS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x3fcca8648651e5b974dd6d3e50f61567779772a8",
    earnContractAddress: "0xB33Ed43421344b9Afc9f2568f1fe0576A705ea64",
    earnedOracle: "tokens",
    earnedOracleId: "POTS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      moonpot
    ]
  },
  {
    id: "moo_pots_bnb-moonpot",
    poolId: "banana-pots-bnb",
    name: "Moonpot",
    assets: [
      "POTS",
      "BNB"
    ],
    earnedToken: "POTS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x3fcca8648651e5b974dd6d3e50f61567779772a8",
    earnContractAddress: "0xFbb7004696c7E9bEd8d138A00d050Faeb9712ba5",
    earnedOracle: "tokens",
    earnedOracleId: "POTS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      moonpot
    ]
  },
  {
    id: "moo_belt_4belt-viralata",
    poolId: "belt-4belt",
    name: "Viralata",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "AURO",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x8d9a79314c4e09a7c53c124195caeb8b89f4879d",
    earnContractAddress: "0xf71B9fE4454a2beA4F20adad32f9Ff0D3335A89e",
    earnedOracle: "tokens",
    earnedOracleId: "AURO",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/viralata/logo.png",
        background: "stake/viralata/bg.png",
        text: "Viralata Finance's sole goal is to drive mainstream adoption and use of decentralised assets in Brazil through decreasing barriers to entry and supporting real world use cases.",
        website: "https://app.viralata.finance/",
        social: {
          telegram: "https://t.me/viralatafinance_eng",
          twitter: "https://www.twitter.com/viralatafinance"
        }
      }
    ]
  },
  {
    id: "moo_bifi-elk",
    poolId: "bifi-maxi",
    name: "Elk",
    logo: "single-assets/BIFI.png",
    earnedToken: "ELK",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
    earnContractAddress: "0xE34FAdb095E9bCD25923208d42fAC71a2d75286f",
    earnedOracle: "tokens",
    earnedOracleId: "ELK",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/elk/logo.png",
        background: "stake/elk/bg.png",
        text: "Elk is a user-friendly hub for cross-chain DeFi. The ElkNet multi-bridge supports trading, liquidity mining, and instant transfers across an expanding multitude of networks, including BSC, Avalanche, Polygon, Fantom, HECO, and xDai.",
        website: "https://elk.finance/",
        social: {
          telegram: "https://t.me/elk_finance",
          twitter: "https://twitter.com/elk_finance"
        }
      }
    ]
  },
  {
    id: "moo_beltbtc-omnifarm",
    poolId: "belt-beltbtc",
    name: "OmniFarm",
    logo: "single-assets/BTCB.svg",
    earnedToken: "USDO",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x5801D0e1C7D977D78E4890880B8E579eb4943276",
    earnContractAddress: "0x871AC67F0880a14252737CE9Ac12654ffce37B3F",
    earnedOracle: "tokens",
    earnedOracleId: "USDO",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/omnifarm/logo.png",
        background: "stake/omnifarm/bg.png",
        text: "USDO is the most capital efficient stablecoin in DeFi. USDO takes the multi collateral and overcollateralized philosophy of DAI and scales it to support an ever growing collateral list of both crypto and real world assets in a permissionless manner.",
        website: "https://omnitrade.ocp.finance/",
        social: {
          telegram: "http://t.me/opendao",
          twitter: "https://twitter.com/opendaoprotocol"
        }
      }
    ]
  },
  {
    id: "moo_beltbnb-tosdis",
    poolId: "belt-beltbnb",
    name: "Tosdis",
    logo: "single-assets/BNB.png",
    earnedToken: "DIS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x57efFdE2759b68d86C544e88F7977e3314144859",
    earnContractAddress: "0x2Daa8de309A688c5e9084B4A227D75C1998a481d",
    earnedOracle: "tokens",
    earnedOracleId: "DIS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/tosdis/logo.png",
        background: "stake/tosdis/bg.png",
        text: "Tosdis is The Onestop Defi Interoperable Solution where all projects can create staking/farming as a service on ETH/BSC/FTM. TosLabs will serve as an incubator for new and upcoming innovative projects on ETH/BSC/FTM, which will be properly vetted in order to guarantee the smoothest experience for sale participants as well as project owners.",
        website: "https://app.tosdis.finance/stake",
        social: {
          telegram: "https://t.me/Tosdis",
          twitter: "https://twitter.com/TosdisFinance"
        }
      }
    ]
  },
  {
    id: "moo_belt_eth-yel",
    poolId: "belt-belteth",
    name: "YEL",
    logo: "single-assets/ETH.svg",
    earnedToken: "YEL",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xC5C11A531e60378c605383dd54ad1e4C598aD93A",
    earnContractAddress: "0x61Fd5B186A35cC65aea46Fd39f0DBCb3371f8749",
    earnedOracle: "tokens",
    earnedOracleId: "YEL",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/yel/logo.png",
        background: "stake/yel/bg.png",
        text: "YEL Finance is a multi-chain yield enhancement and aggregation platform with several automated farming strategies. Our mission is to build an ecosystem, with looped demand for YEL tokens, while helping projects to jump-start their liquidity or gather extra holders, and maximizing yields and ROI through our protocols.",
        website: "https://yel.finance/",
        social: {
          telegram: "https://t.me/yelfinance",
          twitter: "https://twitter.com/yel_finance"
        }
      }
    ]
  },
  {
    id: "moo_bifi-bhc",
    poolId: "bifi-maxi",
    name: "Billionhappiness",
    logo: "single-assets/BIFI.png",
    earnedToken: "BHC",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4",
    earnContractAddress: "0xa3A4B70AF33E2a71cE48754b2b9B5A40b982F91A",
    earnedOracle: "tokens",
    earnedOracleId: "BHC",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/billionhappiness/logo.png",
        background: "stake/billionhappiness/background.png",
        text: "BillionHappiness is a blockchain technology-based apparel company dedicated to providing happiness through a transparent record of information on its quality products. Our goal is to provide authenticity using blockchain technology to eliminate counterfeit items on the market. Billion Happiness has a token called BHC.",
        website: "https://billionhappiness.finance",
        social: {
          telegram: "https://t.me/BillionHappinessOfficial",
          twitter: "https://twitter.com/BHC_Happiness"
        }
      }
    ]
  },
  {
    id: "moo_belt_4belt-caps",
    poolId: "belt-4belt",
    name: "Ternoa",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "CAPS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xFfBa7529AC181c2Ee1844548e6D7061c9A597dF4",
    earnContractAddress: "0xB94c2c6B5c3021fb78567b7bdC3e47EB1447ec4E",
    earnedOracle: "tokens",
    earnedOracleId: "CAPS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/ternoa/logo.png",
        background: "stake/ternoa/bg.png",
        text: "Ternoa is a substrate based Blockchain revolutionizing data encryption and transmission by using special NFTs as time capsules to send your data to the future.",
        website: "https://www.ternoa.com/en",
        social: {
          telegram: "https://t.me/ternoa",
          twitter: "https://twitter.com/ternoa_"
        }
      }
    ]
  },
  {
    id: "moo_cake_bnb-guard",
    poolId: "cakev2-cake-bnb",
    name: "WolfDen",
    logo: "bnb-pairs/CAKE-BNB.svg",
    earnedToken: "GUARD",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xF606bd19b1E61574ED625d9ea96C841D4E247A32",
    earnContractAddress: "0x5E6061667c589470c5B99152EaA21D35109c8a9D",
    earnedOracle: "tokens",
    earnedOracleId: "gGUARD",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/wolfden/logo.png",
        background: "stake/wolfden/bg.png",
        text: "A first of its kind Cryptocurrency project, designed to help new investors protect themselves through education, safer strategies & open communication... while learning how to make \"eff you\" money in crypto.",
        website: "https://www.wolfdencrypto.com/",
        social: {
          telegram: "https://t.me/wolfdencrypto",
          twitter: "https://twitter.com/wolfdencrypto"
        }
      }
    ]
  },
  {
    id: "moo_banana-moonpot",
    poolId: "banana-bananav2",
    name: "Moonpot",
    logo: "degens/BANANA.svg",
    earnedToken: "POTS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x3Fcca8648651E5b974DD6d3e50F61567779772A8",
    earnContractAddress: "0xe33fE08b6a293a34a29C56533aE6c21ED3D78500",
    earnedOracle: "tokens",
    earnedOracleId: "POTS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/moonpot/logo.png",
        background: "stake/moonpot/bg.png",
        text: "Moonpot is a win-win savings game on Binance Smart Chain powered by Beefy Finance. By depositing crypto into a Moonpot, users gain interest on their assets and enter into a prize draw at the same time. There’s a chance to win weekly prizes paid out in crypto from each Moonpot entered — as well as an exclusive monthly prize draw for $POTS stakers.",
        website: "https://moonpot.com/",
        social: {
          telegram: "https://t.me/moonpotdotcom",
          twitter: "https://twitter.com/moonpotdotcom"
        }
      }
    ]
  },
  {
    id: "moo_bifi-honeyfarm",
    poolId: "bifi-maxi",
    name: "HoneyFarm",
    logo: "single-assets/BIFI.png",
    earnedToken: "HONEY",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xFa363022816aBf82f18a9C2809dCd2BB393F6AC5",
    earnContractAddress: "0x08B5d70e9e5A5117594889Baf078f6C5a3FfeC36",
    earnedOracle: "tokens",
    earnedOracleId: "HONEY",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/honey/logo.png",
        background: "stake/honey/bg.png",
        text: "HoneyFarm Finance is a layered delegated yield farming project with deflationary tokenomics of a maximum supply of 24,650 HONEY tokens. There will be multiple layered projects and each layer will also has pools with previous layers' native tokens. The whole project will be finished after the final emission of a certain layered project, which will be announced in advance.",
        website: "https://honeyfarm.finance/",
        social: {
          telegram: "https://t.me/HoneyFarmChat",
          twitter: "https://twitter.com/HoneyFarmFi"
        }
      }
    ]
  },
  {
    id: "moo_banana-land",
    poolId: "banana-bananav2",
    name: "Landshare",
    logo: "degens/BANANA.svg",
    earnedToken: "LAND",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x9D986A3f147212327Dd658F712d5264a73a1fdB0",
    earnContractAddress: "0xaDC9D67EF0f2a72080253d2bF28EB7EEaDDE5C9C",
    earnedOracle: "tokens",
    earnedOracleId: "LAND",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/landshare/logo.png",
        background: "stake/landshare/bg.png",
        text: "Bringing Real Estate to the Blockchain. Landshare offers a hassle-free alternative to traditional real estate investments.",
        website: "https://landshare.io/",
        social: {
          telegram: "https://t.me/landshare",
          twitter: "https://twitter.com/landshareio"
        }
      }
    ]
  },
  {
    id: "moo_bifi-moonpot",
    poolId: "bifi-maxi",
    name: "Moonpot",
    logo: "single-assets/BIFI.png",
    earnedToken: "POTS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x3Fcca8648651E5b974DD6d3e50F61567779772A8",
    earnContractAddress: "0xA4703D9ba09361da84d1e31c8a356889E7D628F8",
    earnedOracle: "tokens",
    earnedOracleId: "POTS",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/moonpot/logo.png",
        background: "stake/moonpot/bg.png",
        text: "Moonpot is a win-win savings game on Binance Smart Chain powered by Beefy Finance. By depositing crypto into a Moonpot, users gain interest on their assets and enter into a prize draw at the same time. There’s a chance to win weekly prizes paid out in crypto from each Moonpot entered — as well as an exclusive monthly prize draw for $POTS stakers.",
        website: "https://moonpot.com/",
        social: {
          telegram: "https://t.me/moonpotdotcom",
          twitter: "https://twitter.com/moonpotdotcom"
        }
      }
    ]
  },
  {
    id: "moo_bifi-honeyfarm2",
    poolId: "bifi-maxi",
    name: "HoneyFarm",
    logo: "single-assets/BIFI.png",
    earnedToken: "HONEY",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xFa363022816aBf82f18a9C2809dCd2BB393F6AC5",
    earnContractAddress: "0xEB7C46fB3372E952541Ed1d6FCb29EB2C34C3b83",
    earnedOracle: "tokens",
    earnedOracleId: "HONEY",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/honey/logo.png",
        background: "stake/honey/bg.png",
        text: "HoneyFarm Finance is a layered delegated yield farming project with deflationary tokenomics of a maximum supply of 24,650 HONEY tokens. There will be multiple layered projects and each layer will also has pools with previous layers' native tokens. The whole project will be finished after the final emission of a certain layered project, which will be announced in advance.",
        website: "https://honeyfarm.finance/",
        social: {
          telegram: "https://t.me/HoneyFarmChat",
          twitter: "https://twitter.com/HoneyFarmFi"
        }
      }
    ]
  },
  {
    id: "moo_banana-pera",
    poolId: "banana-banana-eol",
    name: "Pera",
    logo: "degens/BANANA.svg",
    earnedToken: "PERA",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xb9D8592E16A9c1a3AE6021CDDb324EaC1Cbc70d6",
    earnContractAddress: "0x38247fCE28480A7BEF2CB7aD134ce091Bd2E1a82",
    earnedOracle: "tokens",
    earnedOracleId: "PERA",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/pera/logo.png",
        background: "stake/pera/bg.png",
        text: "Pera Finance is a decentralized trading competition platform with multi-layered yield farming opportunities. Traders, liquidity providers and holders yield farm together through the DeFi's first decentralized trading competition. Every on-chain PERA transaction (transfer, trade, or liquidity addition/ removal) generates a 2 % transaction fee.",
        website: "https://pera.finance/",
        social: {
          telegram: "https://t.me/perafinance",
          twitter: "https://twitter.com/perafinance"
        }
      }
    ]
  },
  {
    id: "moo_bifi-farmhero",
    poolId: "bifi-maxi",
    name: "FarmHero",
    logo: "single-assets/BIFI.png",
    earnedToken: "HERO",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x9B26e16377ad29A6CCC01770bcfB56DE3A36d8b2",
    earnContractAddress: "0x13465c094e33BB2952aBA55A5b7583655711d5C3",
    earnedOracle: "tokens",
    earnedOracleId: "HERO",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/farmhero/logo.png",
        background: "stake/farmhero/bg.png",
        text: "FarmHero is a cross-chain protocol that mixes NFT, yield farming and gaming. Being a novel DEFI and GAMEFI protocol, FarmHero aims to provide fun and profits at the same time. FarmHero contracts are audited by Certik and PeckShield.",
        website: "https://farmhero.io/",
        social: {
          telegram: "https://t.me/farmheroIO",
          twitter: "https://twitter.com/FarmHeroIO"
        }
      }
    ]
  },
  {
    id: "moo_bifi-fruits",
    poolId: "bifi-maxi",
    name: "Fruit",
    logo: "single-assets/BIFI.png",
    earnedToken: "FRUIT",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x4ECfb95896660aa7F54003e967E7b283441a2b0A",
    earnContractAddress: "0x63D4b32bB980C7b0f7f0e5bc9585Ba4f78d8102C",
    earnedOracle: "tokens",
    earnedOracleId: "FRUIT",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/fruit/logo.png",
        background: "stake/fruit/background.png",
        text: "Fruit's Adventures focus on fun first with our Binance Smart Chain powered fruit adventures. Players can win Fruit tokens by playing our decentralized games. The goal of the FRUIT Token DeFi Project is to use Decentralized Finance blockchains to develop and implement fun, skill-based games to increase the potential footprint of crypto usage on the market. FRUIT is dedicated to developing these games one at a time. Currently, all major effort has been focused on recreating the popular Fruit's Adventures slot game and implementing crypto exchange into it. The game has been incredibly popular in Asia for more than 30 years as a street slot game because of its high reward system. You can exchange FRUIT Tokens to play immediately and win more as you play and achieve high marks in the slots! The reason for its popularity is the high payout potential. It uses 8 stake buttons and has 22 units. Nearly every spin will win, with an overall winning rate of over 95%!",
        website: "https://www.fruitsadventures.com",
        social: {
          telegram: "https://t.me/fruitsadventures_com",
          twitter: "https://twitter.com/FruitsAdventure"
        }
      }
    ]
  },
  {
    id: "moo_cake-krown",
    poolId: "cake-cakev2",
    name: "KingDefi",
    logo: "single-assets/CAKE.svg",
    earnedToken: "mooKingDefiKROWN",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xEb4804389A843676686715785C8Df27EA6E43F9b",
    earnContractAddress: "0x584C90FEB63a8fAE7350f055C6880eD10FDd8918",
    earnedOracle: "tokens",
    earnedOracleId: "KRW",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/krown/logo.png",
        background: "stake/krown/background.png",
        text: "THE FIRST AI YIELD FARMING AGGREGATOR ON BINANCE SMART CHAIN AND SOLANA. KingDeFi is a DeFi project combining two main areas: analytics and monitoring where we provide a market overview, liquidity pool search engine and portfolio tracking to users and farming as we are a yield optimizer project on BSC and Solana",
        website: "https://kingdefi.io/",
        social: {
          telegram: "https://t.me/KingDefi_Community",
          twitter: "https://twitter.com/KingDefi2"
        }
      }
    ]
  },
  {
    id: "moo_cake-cakev2",
    poolId: "cake-cakev2",
    name: "Beefy",
    logo: "single-assets/CAKE.svg",
    earnedToken: "mooBIFI",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xf7069e41C57EcC5F122093811d8c75bdB5f7c14e",
    earnContractAddress: "0xA17A86e836199489801A00B50b9C09525ddC232b",
    earnedOracle: "tokens",
    earnedOracleId: "BIFI",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/beefy/beefyfinance.png",
        logoNight: "stake/beefy/beefyfinance_night.png",
        background: "stake/beefy/background.png",
        text: "Beefy Finance is the Multichain Yield Optimizer that allows its users to earn compound interest on their holdings. A yield optimizer is an automated service that seeks to gain the maximum possible return on crypto-investments made through DeFi platforms. This is much more efficient than attempting to maximize your returns by doing everything manually. It also means you don’t have to sit in front of a screen all day. So Beefy Finance is a platform that puts your crypto to work for maximum ROI with minimum effort. $BIFI is the governance token of the Beefy Finance platform. This means that when you own some $BIFI, you get the right to create and vote on proposals to do with the future of the platform. Third, the fun part: $BIFI tokens can be staked on Beefy to earn a share of the revenue created by the Beefy platform.",
        website: "https://app.beefy.finance",
        social: {
          telegram: "http://t.me/beefyfinance",
          twitter: "https://twitter.com/beefyfinance"
        }
      }
    ]
  },
  {
    id: "moo_merlin-merlin",
    poolId: "merlin-merlin-eol",
    name: "Merlin Lab",
    logo: "single-assets/MERL.svg",
    earnedToken: "MERL",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xDA360309C59CB8C434b28A91b823344a96444278",
    earnContractAddress: "0x0c0487579b4378dbF5199d468bd3c6E8B7bB97fE",
    earnedOracle: "tokens",
    earnedOracleId: "MERL",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/merlin/logo.png",
        background: "stake/merlin/background.png",
        text: "Merlin is an auto-compounding yield aggregator with an ecosystem optimized to focus on safe and sustainable maximum yield return. Merlin takes care of gas costs, APY tracking, optimal yield strategies, security with the goal of maximizing DeFi users' yield farming at the lowest possible cost (All APY & APRs displayed are inclusive of fees).",
        website: "https://merlinlab.com/farm",
        social: {
          telegram: "https://t.me/merlinlab",
          twitter: "https://twitter.com/MerlinLab_"
        }
      }
    ]
  },
  {
    id: "moo_steel_iron-merlin",
    poolId: "iron-steel-iron",
    name: "Merlin Lab",
    logo: "degens/IRON.png",
    earnedToken: "mooMerlinMERL",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x6261d793BdAe82842461A72B746bc18a5B7D2Bc4",
    earnContractAddress: "0xa5BD31B804f9CDfE7de37f4EaEB19156cAeDEC3A",
    earnedOracle: "tokens",
    earnedOracleId: "MERL",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    fixedStatus: true,
    partners: [
      {
        logo: "stake/merlin/logo.png",
        background: "stake/merlin/background.png",
        text: "Merlin is an auto-compounding yield aggregator with an ecosystem optimized to focus on safe and sustainable maximum yield return. Merlin takes care of gas costs, APY tracking, optimal yield strategies, security with the goal of maximizing DeFi users' yield farming at the lowest possible cost (All APY & APRs displayed are inclusive of fees).",
        website: "https://merlinlab.com/farm",
        social: {
          telegram: "https://t.me/merlinlab",
          twitter: "https://twitter.com/MerlinLab_"
        }
      }
    ]
  },
  {
    id: "moo_1inch_1inch-ten",
    poolId: "1inch-1inch-eol",
    name: "TEN Finance",
    logo: "single-assets/INCH.png",
    earnedToken: "TENFI",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xd15C444F1199Ae72795eba15E8C1db44E47abF62",
    earnContractAddress: "0xebF08C4F58E443b94b06b4281834dB29c888dD1F",
    earnedOracle: "tokens",
    earnedOracleId: "TENFI",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/tenfi/logo.png",
        background: "stake/tenfi/background.png",
        text: "TEN is a yield aggregator, audited by Certik, that simplifies staking and yield farming with the most liquid Binance Smart Chain Liquidity Pools available and provides a robust yield earning environment on the market while adhering to security, sustainability, longevity, and simplicity. TEN is the Token Enrichment Network, decentralized finance, simplified! TEN aims to simplify DeFi by creating a seamless and streamlined process in staking your assets to earn a rewardingly high yet modest APY in the simplest and safest manner while ensuring sustainable growth within the TEN platform across multiple farming ecosystems and optimizing returns for maximum yields in a sustainable and robust manner. TEN was launched to create a truly long-term, yet beneficial model that would ensure the longevity of the $TENFI ecosystem that allows for TEN to adapt and evolve with the DeFi space in general. This allows for high yield opportunities and ensuring that the $TENFI ecosystem continues to evolve and adapt. $TENFI aims to be a vanguard in decentralized finance.\n",
        website: "https://ten.finance",
        social: {
          telegram: "https://t.me/tenfinance",
          twitter: "https://twitter.com/tenfinance"
        }
      }
    ]
  },
  {
    id: "moo_mdex_mdx-panther",
    poolId: "mdex-bsc-mdx",
    name: "PantherSwap",
    logo: "single-assets/MDX.png",
    earnedToken: "PANTHER",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x1f546ad641b56b86fd9dceac473d1c7a357276b7",
    earnContractAddress: "0xB415c2f5555C163563d1F17830DBEEfA0168cA87",
    earnedOracle: "tokens",
    earnedOracleId: "PANTHER",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/panther/logo.png",
        background: "stake/panther/background.png",
        text: "PantherSwap is the first automatic liquidity acquisition yield farm and AMM decentralized exchange running on Binance Smart Chain with lots of unique and creative features that let you earn and win. We plan to add a trading incentive mechanism to our own AMM dex. Users can earn tokens by trading on PantherSwap. But different from traditional trading mining, the rewards on PantherSwap for trading can be different tokens. Other projects can provide their own tokens as rewards for specified trading pairs. More details about it will be published later.",
        website: "https://pantherswap.com/",
        social: {
          telegram: "https://t.me/PantherSwap",
          twitter: "https://twitter.com/PantherSwap"
        }
      }
    ]
  },
  {
    id: "moo_dop_lp-dop",
    poolId: "dopple-dop-lp",
    name: "Dopple Finance",
    logo: "uncategorized/DOPPLE-DOP-LP.svg",
    earnedToken: "DOP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x844FA82f1E54824655470970F7004Dd90546bB28",
    earnContractAddress: "0xd4c1FEb9defBcf1f4a56133201C29ba9421f9fb4",
    earnedOracle: "tokens",
    earnedOracleId: "DOP",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/dopple/logo.png",
        background: "stake/dopple/background.png",
        text: "Dopple Finance is building a Stablecoin DeFi ecosystem on the Binance Smart Chain. Our main product is a decentralized stablecoin exchange, which allows users to efficiently swap stablecoins and pegged assets on the Binance Smart Chain. Dopple currently supports the following stablecoins: BUSD, USDT, DAI, USDC, UST & DOLLY. Liquidity Providers can earn trading fees in form of stablecoins by supplying capital to the underlying liquidity pools. Liquidity Providers can also earn Dopple Token Rewards by farming LP tokens or by staking Dopple tokens.",
        website: "https://dopple.finance/Swap",
        social: {
          telegram: "https://t.me/dopplefi",
          twitter: "https://twitter.com/dopplefi"
        }
      }
    ]
  },
  {
    id: "moo_jetswap-wings",
    poolId: "jetswap-wings",
    name: "JetSwap",
    logo: "degens/WINGS.svg",
    earnedToken: "WINGS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x0487b824c8261462f88940f97053e65bdb498446",
    earnContractAddress: "0x1481d3da44eB00697bbBcEA85172179D3F3dC82C",
    earnedOracle: "tokens",
    earnedOracleId: "WINGS",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/jetswap/logo.png",
        background: "stake/jetswap/background.png",
        text: "Jetswap is a decentralized Automated Market Maker (AMM) on Binance Smart Chain with low fees and instant trade execution. Trade from the comfort of your own wallet! Trade directly from your favorite wallet application! There are no accounts to set up or trading limits. You have full control over your assets and Jetswap has 0 control over your assets. You can earn BIG WINGS rewards when you deposit your Jetswap WINGS-LP to the WINGS farm. You can also farm WINGS with single assets like WINGS, GFCE, JETS, and FTS! The WINGS LP tokens generate trading fees for the depositor! Even if there is not a supported WINGS farm you can still earn a percentage of every trading fee.",
        website: "https://jetswap.finance/",
        social: {
          telegram: "https://t.me/jetfuelfinance",
          twitter: "https://twitter.com/Jetfuelfinance"
        }
      }
    ]
  },
  {
    id: "moo_dumpling-sdump",
    poolId: "bifi-maxi",
    name: "DumplingSwap",
    logo: "single-assets/BIFI.png",
    earnedToken: "SDUMP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x13F6751ba11337BC67aBBdAd638a56194ee133B8",
    earnContractAddress: "0xc842B409FFA6d0CC2F74d99F6016a7CBac92E97b",
    earnedOracle: "tokens",
    earnedOracleId: "SDUMP",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/dumpling/logo.png",
        background: "stake/dumpling/background.png",
        text: "DumplingSwap is a gamified, community-driven yield farming project developed by a team of passionate Software Developers with proven experience in the field of DeFi. Our mission is to create an economically sustainable yield farming community by providing a powerful DeFi ecosystem that wants to revolutionize this sector. We are aiming to become an integral part of BSC Ecosystem and a competitor to Eth DeFi projects.",
        website: "https://app.dumplingdefi.finance/",
        social: {
          telegram: "https://t.me/dumplingswap_official",
          twitter: "https://twitter.com/dumpling_swap"
        }
      }
    ]
  },
  {
    id: "moo_grandbanks-grand",
    poolId: "cakev2-bifi-bnb",
    name: "The Grand Banks",
    logo: "bnb-pairs/BIFI-BNB.png",
    earnedToken: "GRAND",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xee814f5b2bf700d2e843dc56835d28d095161dd9",
    earnContractAddress: "0x50Bd1D83619143e4af8d6f1BBEe8062E3c967EaF",
    earnedOracle: "tokens",
    earnedOracleId: "GRAND",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/grandbanks/logo.png",
        background: "stake/grandbanks/background.png",
        text: "Let’s bring yield farming back to basics. The Narwhalswap team is here to make it happen. Imagine, no barrier for entry, no multiple steps to farming — just simple, easy sailing following the tides of the trade. Deposit your favorite token, be it BNB, BUSD, or even our very own GRAND or NAR, and start earning **$GRAND**. There is no need to first pool tokens together in order to deposit and there is no need to switch chains. The Grand Banks does it for you! Save yourself time and fees and simply start investing.",
        website: "https://www.thegrandbanks.finance/#/",
        social: {
          telegram: "https://t.me/theGrandBanks",
          twitter: "https://twitter.com/Grandbanks13"
        }
      }
    ]
  },
  {
    id: "moo_bhc-hps2",
    poolId: "hps-hps",
    name: "Billionhappiness",
    logo: "single-assets/HPS.png",
    earnedToken: "BHC",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x6fd7c98458a943f469e1cf4ea85b173f5cd342f4",
    earnContractAddress: "0x8e5fF8542Bd2c675F22C58ee146607df822F30B5",
    earnedOracle: "tokens",
    earnedOracleId: "BHC",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/billionhappiness/logo.png",
        background: "stake/billionhappiness/background.png",
        text: "BillionHappiness is a blockchain technology-based apparel company dedicated to providing happiness through a transparent record of information on its quality products. Our goal is to provide authenticity using blockchain technology to eliminate counterfeit items on the market. Billion Happiness has a token called BHC.",
        website: "https://billionhappiness.finance",
        social: {
          telegram: "https://t.me/BillionHappinessOfficial",
          twitter: "https://twitter.com/BHC_Happiness"
        }
      }
    ]
  },
  {
    id: "moo_belt_btc-iron",
    poolId: "belt-beltbtc",
    name: "Iron Finance",
    logo: "single-assets/BTCB.svg",
    earnedToken: "STEEL",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x9001eE054F1692feF3A48330cB543b6FEc6287eb",
    earnContractAddress: "0x57db966945691Ac03C704566BF5E20207def4215",
    earnedOracle: "tokens",
    earnedOracleId: "STEEL",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/ironfinance/logo.png",
        background: "stake/ironfinance/background.png",
        text: "Inspired by FRAX, a unique fractionally-algorithmic stablecoin on the Ethereum network, and utilizing a similar approach, we have created IRON, the first partially-collateralized stablecoin on Binance Smart Chain. The IRON protocol makes use of 2 tokens to achieve its goal:  STEEL and IRON. STEEL - The share token of the Iron finance protocol. Serves as part of the collateral behind IRON. Backed by seigniorage revenue as well as the value of any excess collateral. IRON -  A stablecoin pegged to $1. Partially backed by a continuously adjusting ratio of collateral equal to $1 in value. Check out the docs for more information: https://docs.iron.finance/",
        website: "https://app.iron.finance/",
        social: {
          telegram: "https://t.me/ironfinance",
          twitter: "https://twitter.com/IronFinance"
        }
      }
    ]
  },
  {
    id: "moo_belt_4belt-tofy",
    poolId: "belt-4belt",
    name: "MarshmallowDefi",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "TOFY",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xE1F2d89a6c79b4242F300f880e490A70083E9A1c",
    earnContractAddress: "0x42b9939020c2CeD30eA54B0A05D3aeD45DA74F54",
    earnedOracle: "tokens",
    earnedOracleId: "TOFY",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/safefarm/logo.png",
        background: "stake/safefarm/background.png",
        text: "Toffie is the reference token for SAFEFARM within the MarshMallow ecosystem, it is the currency you receive in exchange when you pool / farm your Reflection Tokens.  Toffie is a Mintable token and will serve for multiple functions including the remuneration, purchase and exchange of NFTs on the platform within the Marshmallow Market-place.  The basic idea will be to create real NFTs made and developed by professionals in the sector, so as to bring to the community real valuables that can be exchanged and appreciated over time. All this mechanism can be managed by Toffie.",
        website: "https://safefarms.marshmallowdefi.com/info",
        social: {
          telegram: "https://t.me/MarshmallowDeFi",
          twitter: "https://twitter.com/SwapMarshmallow"
        }
      }
    ]
  },
  {
    id: "moo_belt_btc-xbtc",
    poolId: "belt-beltbtc",
    name: "xBTC",
    logo: "single-assets/BTCB.svg",
    earnedToken: "BXBTC-BNB LP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x8d112fcdf377a2c4cb41b60aae32199f939a866c",
    earnContractAddress: "0x1BA1B43227325E8Dc0FA1378d7C41fa7F49e32e0",
    earnedOracle: "lps",
    earnedOracleId: "banana-bxbtc-bnb",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/xbtc/logo.png",
        background: "stake/xbtc/background.png",
        text: "xBTC gives users one token access to every single digital asset on earth, pegged against Bitcoin dominance. We call this a “Dominance Hedge.” As the inferior and sluggish Bitcoin loses its dominance, xBTC holders will benefit. DeFi, Social Networks, Gaming, Smart Contracts – all blockchains and use cases are represented by xBTC. With a few clicks of the mouse, users benefit from access to the price action of hundreds of digital assets. This is a brand new type of hedge and asset – this is xBTC.\n",
        website: "https://xbtc.fi/",
        social: {
          telegram: "https://t.me/xBTC_Official",
          twitter: "https://twitter.com/XBTC_Official"
        }
      }
    ]
  },
  {
    id: "moo_belt_eth-icarus",
    poolId: "belt-belteth",
    name: "Icarus Finance",
    logo: "single-assets/ETH.svg",
    earnedToken: "ICA",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x95111f630ac215eb74599ed42c67e2c2790d69e2",
    earnContractAddress: "0xf6259516B5c38a110f634FcC2f14fEF02a318B66",
    earnedOracle: "tokens",
    earnedOracleId: "ICA",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/icarus/logo.png",
        background: "stake/icarus/background.png",
        text: "icarus.finance is a first of its kind decentralized mining protocol that brings Bitcoin and Ethereum hashrate to the Binance Smart Chain, combining it with further DeFi applications Do you want to mine, or farm crypto assets? Perhaps both? No problem! At icarus.finance, you choose\"\n",
        website: "http://icarus.finance",
        social: {
          telegram: "https://t.me/icarus_finance",
          twitter: "https://twitter.com/zetta_icarus"
        }
      }
    ]
  },
  {
    id: "moo_belt_eth-satis",
    poolId: "belt-belteth",
    name: "Satis Finance",
    logo: "single-assets/ETH.svg",
    earnedToken: "SAT",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xA1928c0D8F83C0bFB7ebE51B412b1FD29A277893",
    earnContractAddress: "0x36361230D435ce1829634cCd68Ba479628CaFe04",
    earnedOracle: "tokens",
    earnedOracleId: "SAT",
    partnership: true,
    status: "closed",
    fixedStatus: true,
    isMooStaked: true,
    partners: [
      {
        logo: "stake/satis/logo.png",
        background: "stake/satis/background.png",
        text: "*Satis is an Automatic Deflationary Token, which means that there is a 2% burn on transactions, please keep this in mind when transferring and trading this token. (slippage 2,5%)* SatisFinance is a brand new DeFi project designed by an experienced development team as the 4th generation deflationary yield farm on Binance Smart Chain. Besides the buyback burning mechanism introduced by Goose Finance and Fullsail Finance, SatisFinance has implemented unique innovative features to fight against the inflation problem faced by most traditional yield farms.\n",
        website: "https://satis.finance/",
        social: {
          telegram: "https://t.me/satisfiChat",
          twitter: "https://twitter.com/FinanceSatis"
        }
      }
    ]
  },
  {
    id: "moo_bhc-hps",
    poolId: "bhc-bhc-eol",
    name: "Billionhappiness",
    logo: "single-assets/BHC.png",
    earnedToken: "BIFI",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    earnContractAddress: "0x79d9dd12f5c070eFbD9721F06dd8811825c9d9FC",
    earnedOracle: "tokens",
    earnedOracleId: "BIFI",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/billionhappiness/logo.png",
        background: "stake/billionhappiness/background.png",
        text: "BillionHappiness is a blockchain technology-based apparel company dedicated to providing happiness through a transparent record of information on its quality products. Our goal is to provide authenticity using blockchain technology to eliminate counterfeit items on the market. Billion Happiness has a token called BHC.",
        website: "https://billionhappiness.finance",
        social: {
          telegram: "https://t.me/BillionHappinessOfficial",
          twitter: "https://twitter.com/BHC_Happiness"
        }
      }
    ]
  },
  {
    id: "moo_auto_eth-apys",
    poolId: "auto-eth-v2-eol",
    name: "APYSwap",
    logo: "single-assets/ETH.svg",
    earnedToken: "APYS-BNB LP",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xE5783Cc9dFb3E7e474B81B07369a008e80F1cEdb",
    earnContractAddress: "0x9A7DB018897B99F47661EcFFb143A7BF80724a7d",
    earnedOracle: "lps",
    earnedOracleId: "cake-apys-bnb",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/apyswap/logo.png",
        background: "stake/apyswap/background.png",
        text: "Start Winning Today With APYSwap Staking. Staking is the process of holding tokens in a cryptocurrency wallet to support the operations of a network. Participants are rewarded for depositing and holding coins, with constant guaranteed time-based returns. Rewards are calculated based on staking time: the longer you stake, the more you earn.",
        website: "https://apyswap.com/",
        social: {
          telegram: "https://t.me/apyswapcom",
          twitter: "https://twitter.com/apyswap"
        }
      }
    ]
  },
  {
    id: "moo_belt_venus-mash",
    poolId: "belt-venus-blp-eol",
    name: "MarshmallowDeFi",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "MASH",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x787732f27D18495494cea3792ed7946BbCFF8db2",
    earnContractAddress: "0x2Ad5e76e09ef581a8fb7B66901D80C75Db571824",
    earnedOracle: "tokens",
    earnedOracleId: "MASH",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/mash/logo.png",
        background: "stake/mash/background.png",
        text: "MarshmallowDeFi (MASH) is the next generation of Automated Market Making (AMM) decentralized exchange with a deflationary governance token model. We are your go-to yield farm running on Binance Smart Chain and Pancakeswap exchange, with lots of other features that let you earn tokens. As with the current wave of second-generation yield farms, the aim is to create a perpetual deflation token, the MASH, with a continual burn mechanism in order to field an environment that can sustain long-term gains with consistently high APR for greater earnings.",
        website: "https://marshmallowdefi.com/",
        social: {
          telegram: "https://t.me/MarshmallowDeFi",
          twitter: "https://twitter.com/SwapMarshmallow"
        }
      }
    ]
  },
  {
    id: "moo_mdx_bnb-palm",
    poolId: "mdex-bsc-mdx-bnb",
    name: "YieldBay",
    logo: "bnb-pairs/MDX-BNB.png",
    earnedToken: "PALM",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x9768E5b2d8e761905BC81Dfc554f9437A46CdCC6",
    earnContractAddress: "0x4B86435B0749b27008060Cb5696fceB606386835",
    earnedOracle: "tokens",
    earnedOracleId: "PALM",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/yieldbay/logo.png",
        background: "stake/yieldbay/background.png",
        text: "Our mission is to create the most Economically Sustainable and Accessible yield farming community on BSC by providing a simple user interface, facilitating access to DeFi, and creating a perpetual deflation token, the PALM token. YieldBay has the goal of fostering AMM and DeFi market by facilitating the participation of traditional investors in the Crypto Ecosystem. Expanding the potential market reach requires simple and smooth interfaces as well as easier connections between Fiat and Crypto markets. To increase protocol economical sustainability, we aim at increasing burning fees and defining additional deflationary strategies benefitting holders.",
        website: "https://yieldbay.finance/",
        social: {
          telegram: "https://t.me/yieldbay",
          twitter: "https://twitter.com/yieldbay"
        }
      }
    ]
  },
  {
    id: "moo_auto_btc-typh",
    poolId: "auto-btc-v2-eol",
    name: "Typhoon",
    logo: "single-assets/BTCB.svg",
    earnedToken: "TYPH",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x4090e535F2e251F5F88518998B18b54d26B3b07c",
    earnContractAddress: "0x1643BC20913fA2D62C521E7cE8fFeD9e1Dd87964",
    earnedOracle: "tokens",
    earnedOracleId: "TYPH",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/thypoon/logo.png",
        background: "stake/thypoon/background.png",
        text: "Typhoon is a decentralized, fully on-chain implemented project to enable private transactions between 2 wallets. It does this cleverly by somewhat taking on the role of proxy, but on cryptography steroids. Typhoon utilizes zkSNARK, a novel form of zero-knowledge cryptography. zkSNARK makes it possible for users to prove possession of information, without actually revealing that information. When depositing money into Typhoon, the user generates a random secret and submits a part of it (a hash) along with the assets into the smart contract. In order to then withdraw that deposit again, the user has to provide cryptographic proof that he is indeed the owner of a secret to an unspent deposit. All without revealing the secret he holds to the public blockchain, thanks to zkSNARK!",
        website: "https://app.typhoon.network/",
        social: {
          telegram: "https://t.me/typhoonnetwork",
          twitter: "https://twitter.com/TyphoonCrypto"
        }
      }
    ]
  },
  {
    id: "moo_bifi-biti",
    poolId: "bifi-maxi",
    name: "BitiCity",
    logo: "single-assets/BIFI.png",
    earnedToken: "BITI",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xA25Dab5B75aC0E0738E58E49734295baD43d73F1",
    earnContractAddress: "0xa8b86b9AF7e844DA90A2e72840Ad01CCBD11EdC3",
    earnedOracle: "tokens",
    earnedOracleId: "BITI",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/biticity/logo.png",
        background: "stake/biticity/background.png",
        text: "Biti City is a NFT yield farm that combines the fun of gacha and leveling your NFT Bitibots to earn BITI token rewards. With the understanding that two is better than one, Bitibots are able to combine and breed newer generation Bitibots with the ability to earn BITI token (BITI) rewards via mining, sacrificing their parts in the process for the greater good. Each Bitibot’s unique set of DNA attributes determines their mining hashrate, and the overall success of Biti City. As a Bitibot master, the fate of the world now rests in your hands…",
        website: "https://www.biti.city",
        social: {
          telegram: "https://t.me/biti_city",
          twitter: "https://twitter.com/bitibots"
        }
      }
    ]
  },
  {
    id: "moo_belt_venus-palm",
    poolId: "belt-venus-blp-eol",
    name: "YieldBay",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "PALM",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x9768E5b2d8e761905BC81Dfc554f9437A46CdCC6",
    earnContractAddress: "0xC1B4ed2861639ebFaFAeDb7eD2381052454bab43",
    earnedOracle: "tokens",
    earnedOracleId: "PALM",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/yieldbay/logo.png",
        background: "stake/yieldbay/background.png",
        text: "Our mission is to create the most Economically Sustainable and Accessible yield farming community on BSC by providing a simple user interface, facilitating access to DeFi, and creating a perpetual deflation token, the PALM token. YieldBay has the goal of fostering AMM and DeFi market by facilitating the participation of traditional investors in the Crypto Ecosystem. Expanding the potential market reach requires simple and smooth interfaces as well as easier connections between Fiat and Crypto markets. To increase protocol economical sustainability, we aim at increasing burning fees and defining additional deflationary strategies benefitting holders.",
        website: "https://yieldbay.finance/",
        social: {
          telegram: "https://t.me/yieldbay",
          twitter: "https://twitter.com/yieldbay"
        }
      }
    ]
  },
  {
    id: "moo_cake_bnb-bingo",
    poolId: "auto-cake-bnb-eol",
    name: "BingoCash",
    logo: "bnb-pairs/CAKE-BNB.svg",
    earnedToken: "sBGO",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x53F39324Fbb209693332B87aA94D5519A1a49aB0",
    earnContractAddress: "0x253aABcC693aEE2180178174241857cBB08BEDD8",
    earnedOracle: "tokens",
    earnedOracleId: "sBGO",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/bingo/logo.png",
        background: "stake/bingo/background.png",
        text: "Bingo Cash Finance is the AlgoStable coin protocol built on the Binance Smart Chain (\"BSC\")  for casino gaming. We are a fair launch project with no pre-sale, no investor, and no pre-mine. Ensuring that everyone is equal from the start. All AlgoStable currently available on BSC has almost no use case. Some have “games” yes but those don’t quite live up to help people release their stress. Many of them are just simple lottery or something very repetitive. On that premise, we took it upon ourselves to serve the good people of BSC with a whole lot of Casino games to quenches your thirst for entertainment.",
        website: "https://bingocash.fi/",
        social: {
          telegram: "https://t.me/bingocash_official",
          twitter: "https://twitter.com/Bingocashfi"
        }
      }
    ]
  },
  {
    id: "moo_auto_wbnb-thunder",
    poolId: "auto-auto-bnb-eol",
    name: "ThunderSwap",
    logo: "bnb-pairs/AUTO-BNB.png",
    earnedToken: "TNDR",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x7Cc46141AB1057b1928de5Ad5Ee78Bb37eFC4868",
    earnContractAddress: "0x04715103e1d8A6D7a2B06737380DBd28a30Ca4Bc",
    earnedOracle: "tokens",
    earnedOracleId: "TNDR",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/thunder/logo.png",
        background: "stake/thunder/background.png",
        text: "ThunderSwap.Finance — The new thundering Yield Farm on BSC Network (Binance Smart Chain). We, at ThunderSwap are a professional software team with lots of love towards crypto. We always wanted to contribute to the crypto community space and show our love for crypto. What else would be a better start than using our skills to build something new and exciting in the hot new DeFi space. Our goal is to contribute to crypto awareness and worldwide crypto acceptance. ThunderSwap is going to be our starting point for this journey. We are going to start small just with Thunder yield farms and pools, but we have a lot of exciting additions that are going to come live soon. ThunderSwap is going to use Thunder Token (TNDR) as the main fuel for the platform and we have a lot of plans to take it to the top charts with our roadmap.",
        website: "https://thunderswap.finance/",
        social: {
          telegram: "https://t.me/thunder_swap",
          twitter: "https://twitter.com/thunder_swap"
        }
      }
    ]
  },
  {
    id: "moo_auto_cake-swirl",
    poolId: "auto-cake-eol",
    name: "Swirl Cash",
    logo: "single-assets/CAKE.svg",
    earnedToken: "SWIRL",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x52d86850bc8207b520340B7E39cDaF22561b9E56",
    earnContractAddress: "0x062939d2EAe7586424180E9b4D80e442885A6E2F",
    earnedOracle: "tokens",
    earnedOracleId: "SWIRL",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/swirl/logo.png",
        background: "stake/swirl/background.png",
        text: "Swirl is a BSC-deployed fork of Tornado.cash, the strongest privacy protocol on the Ethereum network. It uses various cryptographic methods, including implementations of zero-knowledge(zkSnarks) proofs to achieve privacy functionality. So we’ve taken something that works, which allows 100M USD worth of tokens per day to regain their right to anonymity, customized it in Swirl for the current DeFi landscape, and brought it to Binance Smart Chain. Now, Swirl will allow you to send BSC cryptocurrency with 100% anonymity! *Swirl is a declinatory Token, which means that there is a 2% burn on transactions that get redistributed, please keep this in mind when transferring and trading this token.*",
        website: "https://swirl.cash/",
        social: {
          telegram: "https://t.me/Swirl_Cash",
          twitter: "https://twitter.com/Swirl_Cash"
        }
      }
    ]
  },
  {
    id: "moo_ellipsis_3pool-zefi",
    poolId: "ellipsis-3eps",
    name: "ZCore Finance",
    logo: "uncategorized/eps3.png",
    earnedToken: "ZEFI",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x0288D3E353fE2299F11eA2c2e1696b4A648eCC07",
    earnContractAddress: "0xc7ccd3520bEa91a87ecf39Ed39d9BD59946ED2b5",
    earnedOracle: "tokens",
    earnedOracleId: "ZEFI",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/zcore/logo.png",
        background: "stake/zcore/background.png",
        text: "ZCore Finance is a decentralized exchange running on Binance Smart Chain and Pancake swap exchange, with features that let you earn and win tokens. What we are trying to do is create a perpetual deflation token, the ZEFI, that allows a constant price pump with a sufficient burn mechanism. We are not trying to replace the swap & exchange but to add value into the system and create a suitable and sustainable environment for people to yield farm with high APR.",
        website: "https://finance.zcore.network/",
        social: {
          telegram: "https://t.me/ZCoreMiners",
          twitter: "https://twitter.com/ZCoreCrypto"
        }
      }
    ]
  },
  {
    id: "moo_1inch-hps",
    poolId: "1inch-1inch-eol",
    name: "Billionhappiness",
    logo: "single-assets/INCH.png",
    earnedToken: "HPS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xeDa21B525Ac789EaB1a08ef2404dd8505FfB973D",
    earnContractAddress: "0x9ae4496b063f5715561Cbe8f1d389a3FE4720258",
    earnedOracle: "tokens",
    earnedOracleId: "HPS",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/billionhappiness/logo.png",
        background: "stake/billionhappiness/background.png",
        text: "BillionHappiness is a blockchain technology-based apparel company dedicated to providing happiness through a transparent record of information on its quality products. Our goal is to provide authenticity using blockchain technology to eliminate counterfeit items on the market. Billion Happiness has a token called BHC.",
        website: "https://billionhappiness.finance",
        social: {
          telegram: "https://t.me/BillionHappinessOfficial",
          twitter: "https://twitter.com/BHC_Happiness"
        }
      }
    ]
  },
  {
    id: "moo_auto_wbnb-naut",
    poolId: "auto-wbnb-v2-eol",
    name: "Astronaut",
    logo: "single-assets/BNB.png",
    earnedToken: "NAUT",
    earnedTokenDecimals: 8,
    earnedTokenAddress: "0x05B339B0A346bF01f851ddE47a5d485c34FE220c",
    earnContractAddress: "0x47F7CbE34aD6f857662759CDAECC48152237d135",
    earnedOracle: "tokens",
    earnedOracleId: "NAUT",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/astronaut/logo.png",
        background: "stake/astronaut/background.png",
        text: "Astronaut is a protocol built for decentralizing the way in which new projects and ideas coming to the BSC ecosystem raise capital. With Astronaut, decentralized projects will be able to raise and exchange capital cheap and fast. Users will be able to participate in a secure and interoperable environment on the Binance Smart Chain. The deployment of the protocol will take place in III phases. During Phase I Astronaut is a deflationary token that burns and redistributes %s to its holders. During Phase II Astronaut will release its evolved platform and launchpad to provide secure, fair, and affordable launches to both projects and investors alike. Phase III will be the real game-changer with a bridge and a full DeFi ecosystem. Astronaut takes their initiative from the bottom up slowly increasing value to the project and holders of the native NAUT token. *Astronaut is an Automatic Yield Token, which means that there is a 4% burn on transactions that get redistributed, please keep this in mind when transferring and trading this token.*",
        website: "https://astronaut.to/",
        social: {
          telegram: "https://t.me/joinchat/pJTzEu-mhnAzMjMx",
          twitter: "https://twitter.com/astronauttoken"
        }
      }
    ]
  },
  {
    id: "moo_cake_bnb-space",
    poolId: "auto-cake-bnb-eol",
    name: "Farm.Space",
    logo: "bnb-pairs/CAKE-BNB.svg",
    earnedToken: "SPACE",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x0abd3E3502c15ec252f90F64341cbA74a24fba06",
    earnContractAddress: "0x680dDCDAB13735d11a09d3c6d60867B2C75861bE",
    earnedOracle: "tokens",
    earnedOracleId: "SPACE",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/space/logo.png",
        background: "stake/space/background.png",
        text: "Farm your way into DeFi space! Bringing dual farming rewards through margin trading and lending, to yield farming, on the Binance Smart Chain.",
        website: "https://farm.space/",
        social: {
          telegram: "https://t.me/farmdotspace",
          twitter: "https://twitter.com/farmdotspace"
        }
      }
    ]
  },
  {
    id: "moo_bifi_wbnb-nuts",
    poolId: "cake-bifi-bnb",
    name: "Squirrel Finance",
    logo: "bnb-pairs/BIFI-BNB.svg",
    earnedToken: "NUTS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556",
    earnContractAddress: "0x02e2B4212b8F5610E2ab548cB680cb58E61056F6",
    earnedOracle: "tokens",
    earnedOracleId: "NUTS",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/squirrel/logo.png",
        background: "stake/squirrel/background.png",
        text: "In recent months the TVL (total value locked) inside BSC DeFi has skyrocketed due to an endless variety of token-incentivized adoption boosters known as Yield Farming. The problem introduced is some of these are experimental or unaudited projects, which can leave unsavvy farmers exposed if something were to go wrong. Because of the crazy APR % some of these can offer in the first few days, many users completely neglect to account for the possible risks introduced (Yolo-farming). Squirrel aims to resolve this problem by developing a trusted ecosystem to empower, secure & simplify DeFi for end users.",
        website: "https://squirrel.finance/",
        social: {
          telegram: "https://t.me/SquirrelDeFi",
          twitter: "https://twitter.com/SquirrelDeFi"
        }
      }
    ]
  },
  {
    id: "moo_venus_eth-ape",
    poolId: "venus-eth-eol",
    name: "MEMEFARM",
    logo: "stake/memefarm/ape.png",
    earnedToken: "APE",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xa9eA4b786ee5b7A733c035564Bfd9341A4c9FC1e",
    earnContractAddress: "0xEd1B64D539b945Fb291E5487F527D19B7748321e",
    earnedOracle: "tokens",
    earnedOracleId: "APE",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/memefarm/logo.png",
        background: "stake/memefarm/background.png",
        text: "Meme Farm is an exciting protocol that combines DeFi yield-farming and rare non-fungible tokens (NFTs). You’re probably familiar with various food farming coin clones, most of which have a lifespan of 48 hours or less. While these tokens can make a small fortune for early adopters, most of them die out quickly because they lack actual utility. Most are simply governance tokens that get dumped by big farmers because they aren’t interested in participating in creating and voting on proposals. So what’s our solution for creating a high-yield farming token that can last in the long term? It’s to give the tokens actual utility and value (and thus, buy pressure) by combining them with one of the hottest cryptocurrency industries: NFTs.\n",
        website: "https://memefarm.io/",
        social: {
          telegram: "https://t.me/APEcoin_Chat",
          twitter: "https://twitter.com/Go_MemeFarm"
        }
      }
    ]
  },
  {
    id: "moo_belt_venus-slime",
    poolId: "belt-venus-blp-eol",
    name: "Slime Finance",
    logo: "uncategorized/BELT-VENUSBLP.png",
    earnedToken: "SLIME",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x4fCfA6cC8914ab455B5b33Df916d90BFe70b6AB1",
    earnContractAddress: "0xba4Ee74E45De614bd8c2DFEEf16a4c13922C5659",
    earnedOracle: "tokens",
    earnedOracleId: "SLIME",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/slimefinance/logo.png",
        background: "stake/slimefinance/background.png",
        text: "Slime Finance is a new yield farming project on the Binance Smart Chain. We yearn to offer competitive yield rates for our investors by delivering innovative updates in a timely manner. What differentiates us from other yield services is how we interact with our community. We strive to listen to all suggestions given on our social media and let the community vote for features. We are a team of software developers with bold ideas, working rigorously, passionately, and tirelessly on the Slime Finance project. We promise to deliver on the mid to long term a true utility to our Slime Token and fight against traditional yield farm inflation.",
        website: "https://slime.finance/",
        social: {
          telegram: "https://t.me/slimefinance",
          twitter: "https://twitter.com/slimefinance"
        }
      }
    ]
  },
  {
    id: "moo_venus_eth-brew",
    poolId: "venus-eth-eol",
    name: "CafeSwap",
    logo: "single-assets/ETH.svg",
    earnedToken: "BREW",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x790Be81C3cA0e53974bE2688cDb954732C9862e1",
    earnContractAddress: "0xC7e3795259e9f74F4F2265Bf28680a70b41B4334",
    earnedOracle: "tokens",
    earnedOracleId: "BREW",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/cafeswap/cafeswap.png",
        background: "stake/cafeswap/background.png",
        text: "CafeSwap is a yield farming and staking platform on BSC Chain, We have chosen BSC because of its low tnx fees and faster speed. We have built this project to provide the best experience with farming while regulating the supply, we believe in partnerships hence we aim to bring all BSC DeFi ecosystems in one place to have a friendly ecosystem for all of us.",
        website: "https://cafeswap.finance",
        social: {
          telegram: "https://t.me/CafeSwap",
          twitter: "https://twitter.com/cafeswapfinance"
        }
      }
    ]
  },
  {
    id: "moo_venus_btc-ramen",
    poolId: "venus-btcb-eol",
    name: "RamenSwap",
    logo: "single-assets/BTCB.svg",
    earnedToken: "RAMEN",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x4F47A0d15c1E53F3d94c069C7D16977c29F9CB6B",
    earnContractAddress: "0x07613c90c6f4F4910e53A1A6fF5dAc352C6a16e4",
    earnedOracle: "tokens",
    earnedOracleId: "Ramen",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/ramenswap/ramenswap.png",
        background: "stake/ramenswap/background.png",
        text: "The Most Delicious Yield Farm AMM on Binance Smart Chain. RamenSwap Finance is a community driven Yield Farming, DeFi Aggregator and DEX Aggregator on Binance Smart Chain. You can earn RAMEN by staking it on the pool and farming it by providing the liquidity to earn more delicious RAMEN. You can also maximize your return by compounding your token in the vault and connecting several DEX to find the most efficient swapping routes across all platforms that will be released in Q2 to support BSC space.\n",
        website: "https://ramenswap.finance/",
        social: {
          telegram: "https://t.me/ramenswap",
          twitter: "https://twitter.com/ramenswap"
        }
      }
    ]
  },
  {
    id: "moo_auto_cake-salt",
    poolId: "auto-cake-eol",
    name: "SaltSwap",
    logo: "single-assets/CAKE.svg",
    earnedToken: "SALT",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x2849b1aE7E04A3D9Bc288673A92477CF63F28aF4",
    earnContractAddress: "0xDda39b0a11de6e0Ebce995D4A065960532EB332E",
    earnedOracle: "tokens",
    earnedOracleId: "SALT",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/saltswap/saltswap.png",
        background: "stake/saltswap/background.png",
        text: "We are a team of experienced software developers and product managers from top tier tech companies (aka the salts) that want to contribute to the BSC DeFi yield farm movement and take it to the next level. Even though we are starting off with a salty yield farm, we will quickly move on to bigger and greater things. We have big plans for the SALT token.\n",
        website: "https://saltswap.finance/",
        social: {
          telegram: "https://t.me/saltswap",
          twitter: "https://twitter.com/saltswap"
        }
      }
    ]
  },
  {
    id: "moo_venus_ada-crow",
    poolId: "venus-ada-eol",
    name: "CrowFinance",
    logo: "single-assets/ADA.svg",
    earnedToken: "CROW",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0xcc2E12a9b5b75360c6FBf23B584c275D52cDdb0E",
    earnContractAddress: "0x7fcfD0ceb5e9bD1A8b910b52983fe9c8aB656E20",
    earnedOracle: "tokens",
    earnedOracleId: "CROW",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/crowfinance/crowfinance.png",
        background: "stake/crowfinance/background.png",
        text: "CrowFinance an Evolution Yield Farming on Binance Smart Chain with daytime and nighttime burn mechanism system fork from fry and add some function from thug + jetfuel",
        website: "https://www.crowfinance.net/",
        social: {
          telegram: "https://t.me/CrowFinance",
          twitter: "https://twitter.com/crowfinance"
        }
      }
    ]
  },
  {
    id: "moo_auto_wbnb-banana",
    poolId: "auto-wbnb-v2-eol",
    name: "ApeSwap",
    logo: "single-assets/WBNB.svg",
    earnedToken: "BANANA",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
    earnContractAddress: "0xe4267bFDE62B79d27c8BeD68dB8C114ccBbEE545",
    earnedOracle: "tokens",
    earnedOracleId: "BANANA",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/apeswap/logo.png",
        background: "stake/apeswap/background.png",
        text: "ApeSwap is an Automated Market Maker, Yield Farming, and Staking platform on Binance Smart Chain (forked from PancakeSwap). ApeSwap was built by DeFi Apes, for DeFi Apes. We have a dedicated team of experienced monkeys, who have been in the crypto space for years. $BANANA is the native currency of our platform. Stake, pool, and earn $BANANA all on ApeSwap.",
        website: "https://apeswap.finance/",
        social: {
          telegram: "https://t.me/ape_swap",
          twitter: "https://twitter.com/ape_swap"
        }
      }
    ]
  },
  {
    id: "moo_auto_beth-soups",
    poolId: "auto-beth-eth",
    name: "Soup Protocol",
    logo: "uncategorized/BETH-ETH.svg",
    earnedToken: "SOUPS",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x69F27E70E820197A6e495219D9aC34C8C6dA7EeE",
    earnContractAddress: "0x2526Bc61506665494E39cacCaF8c76A1f928D838",
    earnedOracle: "tokens",
    earnedOracleId: "SOUPS",
    partnership: true,
    status: "closed",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/soup/logo.png",
        background: "stake/soup/background.png",
        text: "Soup Protocol is an experimental project that enables the generation of SOUP tokens that runs on Binance Smart Chain. Inspired by the likes of Basis Cash & bDollar, SOUP is an algorithmic token that is designed to pegged its value to the Binance (BNB) token instead of a stablecoin. The protocol is designed to expand and contract the supply of SOUP tokens similar to the way central banks trade fiscal debt to stabilise purchasing power, without any rebases or collateral risk. The SOUP token can be used to buy and sell tokens on Pancake Swap and also can be used to interact with Soup Protocol's upcoming games such as Soup3D.",
        website: "https://soups.finance/",
        social: {
          telegram: "https://t.me/soup_community",
          twitter: "https://twitter.com/soupingGood"
        }
      }
    ]
  },
  {
    id: "moo_baby-aot-usdt-ageoftanks",
    poolId: "baby-aot-usdt",
    name: "AgeOfTanks",
    assets: [
      "AOT",
      "USDT"
    ],
    earnedToken: "A.O.T",
    earnedTokenDecimals: 6,
    earnedTokenAddress: "0x9589014F7a8547B89A6331eEEe32b7fBd5852af9",
    earnContractAddress: "0xDd94124a02Be4fb6d1a12141E107eEA524C111FF",
    earnedOracle: "tokens",
    earnedOracleId: "AOT",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/tanks/logo.png",
        background: "stake/tanks/bg.png",
        text: "If you’re tired of NFT games that are only based on the technology but are not good games.\nIf you’re tired of spending thousands of hours and not getting anything out of it. Look no further…\n\nWELCOME TO EARTH ZERO METAVERSE YEAR 23100\nThe ozone layer that protectively embraced the planet no longer exists. Exposed to harsh solar storms the skies\nrage with turbulent winds. This is an age without oceans. This is an age without flight. This is an age where the\nfight for supremacy hinges on having the Ultimate Armoured Vehicle.\n\nFor who controls the tanks control A.O.T. And who controls the A.O.T, controls the Metaverse!\n\nMine resources, build your NFT tanks, and defend your territory against thousands of other players that will try to\noutsmart you! Are you ready to Assemble.Outwit.Triumph?\n",
        website: "https://ageoftanks.io/",
        social: {
          telegram: "https://t.me/ageoftanksdiscussion",
          twitter: "https://twitter.com/AgeOfTanksNFT?s=09"
        }
      }
    ]
  },
  {
    id: "moo_cakev2-cake-bnb-dibs",
    poolId: "cakev2-cake-bnb",
    name: "DibsMoney",
    assets: [
      "CAKE",
      "BNB"
    ],
    earnedToken: "DSHARE",
    earnedTokenDecimals: 18,
    earnedTokenAddress: "0x26d3163b165BE95137CEe97241E716b2791a7572",
    earnContractAddress: "0x5e0D12A2AD1E74afB435F8EF2750Ed5885a08FEB",
    earnedOracle: "tokens",
    earnedOracleId: "DSHARE",
    partnership: true,
    status: "active",
    isMooStaked: true,
    partners: [
      {
        logo: "stake/dibs/logo.png",
        background: "stake/dibs/bg.png",
        text: "DibsMoney - not just another Tomb fork! dibs.money is a multi-token DeFi protocol pegged to the price of BNB, and with multiple use cases that will drive demand in the short term pipeline, as an example a launch partnership with one of the largest NFT-platforms on the Binance smart chain. \n\n$DIBS is a unique token in that it tracks the price of BNB, all while earning super high APY's. $DSHARE on the other hand is your ticket to earn the freshly minted $DIBS from the dibs.money Piggybank. Whether you're bullish on BNB or on Dshare - dibs.money has an option for you.\n",
        website: "https://www.dibs.money/farm",
        social: {
          telegram: "https://t.me/dibsmoney",
          twitter: "https://twitter.com/DibsMoney"
        }
      }
    ]
  }
];