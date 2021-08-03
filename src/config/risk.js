export const MAX_SCORE = 10;

export const RISKS = {
  COMPLEXITY_LOW: {
    category: 'beefy',
    score: 0,
    title: 'Low complexity strategy',
    explanation:
      'Low complexity strategies have few, if any, moving parts and their code is easy to read and debug. There is a direct correlation between code complexity and implicit risk. A simple strategy effectively mitigates implementation risks.',
    condition:
      'A low complexity strategy should interact with just one audited and well-known smart contract e.g. MasterChef. The strategy serves as a façade for this smart contract, forwarding deposit, harvest and withdrawal calls using a single line of code.',
  },

  COMPLEXITY_MID: {
    category: 'beefy',
    score: 0.3,
    title: 'Medium complexity strategy',
    explanation:
      'Medium complexity strategies interact with two or more audited and well-known smart contracts. Its code is still easy to read, test and debug. It mitigates most implementation risks by keeping things simple, however the interactions between 2 or more systems add a layer of complexity.',
    condition:
      'A medium complexity strategy interacts with 2 or more Well-Known smart contracts. This strategy automates the execution of a series of steps with no forking paths. Every time deposit(), harvest() and withdraw() is called, the same execution path is followed.',
  },

  COMPLEXITY_HIGH: {
    category: 'beefy',
    score: 0.5,
    title: 'High complexity strategy',
    explanation:
      'High complexity strategies interact with one or more well-known smart contracts. These advanced strategies present branching paths of execution. In some cases multiple smart contracts are required to implement the full strategy.',
    condition:
      'A high level complexity strategy can be identified by one or more of the following factors: high cyclomatic complexity, interactions between two or more third-party platforms, implementation split between multiple smart contracts.',
  },

  BATTLE_TESTED: {
    category: 'beefy',
    score: 0,
    title: 'Strategy is battle tested',
    explanation:
      'The more time a particular strategy is running, the more likely that any potential bugs it had have been found, and fixed. This strategy has been exposed to attacks and usage for some time already, with little to no changes. This makes it sturdier. ',
    condition: '',
  },

  NEW_STRAT: {
    category: 'beefy',
    score: 0.3,
    title: 'Strategy is new',
    explanation:
      'The more time a particular strategy is running, the more likely that any potential bugs it had have been found, and fixed. This strategy is a modification or iteration of a previous strat. It hasn’t been battle tested as much as others.',
    condition: '',
  },

  EXPERIMENTAL_STRAT: {
    category: 'beefy',
    score: 0.7,
    title: 'Strategy  is experimental',
    explanation:
      'The more time a particular strategy is running, the more likely that any potential bugs it had have been found, and fixed. This strategy is brand new and has at least one experimental feature. Use it carefully at your own discretion.',
    condition: '',
  },

  IL_NONE: {
    category: 'asset',
    score: 0,
    title: 'Very low or zero projected IL',
    explanation:
      'The asset in this vault has very little or even no expected impermanent loss. This might be because you are staking a single asset, or because the assets in the LP are tightly correlated like USDC-USDT or WBTC-renBTC.',
    condition:
      'Single asset vaults and vaults that manage stablecoins with a peg that isn’t experimental: USDT, USDC, DAI, sUSD, etc.',
  },

  IL_LOW: {
    category: 'asset',
    score: 0.2,
    title: 'Low projected IL',
    explanation:
      'When you are providing liquidity into a token pair, for example ETH-BNB, there is a risk that those assets decouple in price. BNB could drop considerably in relation to ETH. You would lose some funds as a result, compared to just holding ETH and BNB on their own. The assets in this vault have some risks of impermanence loss.',
    condition:
      'Vaults that handle what are normally referred as “Pool 1” LPs would fit here: ETH-USDC, MATIC-AAVE, etc. Governance tokens for smaller projects are normally known as “Pool 2” and thereby excluded.',
  },

  IL_HIGH: {
    category: 'asset',
    score: 0.5,
    title: 'High projected IL',
    explanation:
      'When you are providing liquidity into a token pair, for example ETH-BNB, there is a risk that those assets decouple in price. BNB could drop considerably in relation to ETH. You would lose some funds as a result, compared to just holding ETH and BNB on their own. The assets in this vault have a high or very high risk of impermanence loss.',
    condition:
      'Vaults that handle “Pool 2” LPs go here. These LP normally include the governance token of the farm itself.',
  },

  ALGO_STABLE: {
    category: 'asset',
    score: 0.5,
    title: 'Algorithmic stable, risk of IL',
    explanation:
      'When you are providing liquidity into a token pair, for example ETH-BNB, there is a risk that those assets decouple in price. BNB could drop considerably in relation to ETH. You would lose some funds as a result, compared to just holding ETH and BNB on their own. At least one of the stablecoins held by this vault is an algorithmic stable. This means that the stable peg is experimental and highly risky. Use it carefully at your own discretion.',
    condition:
      '“Stablecoins” with experimental pegs, or tokenomics that have failed repeatedly to hold its peg in the past, go here.',
  },

  LIQ_HIGH: {
    category: 'asset',
    score: 0,
    title: 'High trade liquidity',
    explanation:
      'How liquid an asset is affects how risky it is to hold it. Liquid assets are traded in many places and with good volume. The asset held by this vault has high liquidity. This means that you can exchange your earnings easily in plenty of places.',
    condition: '',
  },

  LIQ_LOW: {
    category: 'asset',
    score: 0.3,
    title: 'Low trade liquidity',
    explanation:
      "How liquid an asset is affects how risky it is to hold it. Liquid assets are traded in many places and with good volume. The asset held by this vault has low liquidity. This means that it isn't as easy to swap and you might incur high slippage when doing so.",
    condition: '',
  },

  MCAP_LARGE: {
    category: 'asset',
    score: 0,
    title: 'High market cap, low volatility asset',
    explanation:
      'The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a large market cap. This means it’s potentially a highly safe asset to hold. The asset has a high potential to stick around and grow over time.',
    condition: 'Top 50 MC by Gecko/CMC',
  },

  MCAP_MEDIUM: {
    category: 'asset',
    score: 0.1,
    title: 'Medium market cap, medium volatility asset',
    explanation:
      'The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a medium market cap. This means it’s potentially a safe asset to hold. The asset has potential to stick around and grow over time.',
    condition: 'Between 50 and 300 MC by Gecko/CMC',
  },

  MCAP_SMALL: {
    category: 'asset',
    score: 0.3,
    title: 'Small market cap, high volatility asset',
    explanation:
      'The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a small market cap. This means it’s potentially a risky asset to hold. The asset has low potential to stick around and grow over time.',
    condition: 'Between 300 and 500 MC by Gecko/CMC',
  },

  MCAP_MICRO: {
    category: 'asset',
    score: 0.5,
    title: 'Micro market cap, Extreme volatility asset',
    explanation:
      'The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a micro market cap. This means it’s potentially a highly risky asset to hold. The asset has low potential to stick around.',
    condition: '+500 MC by Gecko/CMC',
  },

  SUPPLY_CENTRALIZED: {
    category: 'asset',
    score: 1,
    title: 'Token supply is concentrated',
    explanation:
      'When the supply is concentrated in a few hands, they can greatly affect the price by selling. Whales can manipulate the price of the coin. The more people that have a vested interest over a coin, the better and more organic the price action is.',
    condition: 'Less than 50 accounts hold more than 50% of the supply.',
  },

  PLATFORM_ESTABLISHED: {
    category: 'platform',
    score: 0,
    title: 'Platform with known track record',
    explanation:
      'When taking part in a farm, it can be helpful to know the amount of time that the platform has been around and the degree of its reputation. The longer the track record, the more investment the team and community have behind a project. This vault farms a project that has been around for many months.',
    condition: 'The underlying farm has been around for at least 3 months.',
  },

  PLATFORM_NEW: {
    category: 'platform',
    score: 0.5,
    title: 'Platform with little track record',
    explanation:
      'When taking part in a farm, it can be helpful to know the amount of time that the platform has been around and the degree of its reputation. The longer the track record, the more investment the team and community have behind a project. This vault farms a new project, with less than a few months out in the open.',
    condition: 'The underlying farm has been around for less than 3 months.',
  },

  NO_AUDIT: {
    category: 'platform',
    score: 0.3,
    title: 'Platform without third party audit',
    explanation:
      'Audits utilize different methods to assess the integrity of a piece of code. They are not perfect in finding all possible bugs and exploits. They do help improve the code quality and catch many security flaws in the reviewed code. This platform has not undergone an audit by a known third party auditor.',
    condition: '',
  },

  AUDIT: {
    category: 'platform',
    score: 0,
    title: 'Platform audited by trusted reviewer',
    explanation:
      'Audits utilize different methods to assess the integrity of a piece of code. They are not perfect in finding all possible bugs and exploits. They do help improve the code quality and catch many security flaws in the reviewed code. This platform has undergone at least one audit by a known third party auditor.',
    condition:
      'One or more audits from an auditor that has some positive track record in the space.',
  },

  CONTRACTS_VERIFIED: {
    category: 'platform',
    score: 0,
    title: 'Platform contracts are verified',
    explanation:
      'Code running in a particular address is not public by default. Block explorers let developers verify the code behind that address. This is a good practice because it lets other developers audit the code and confirm that it does what it’s supposed to. All the third party contracts that this vault uses are verified. This makes it less risky.',
    condition: '',
  },

  CONTRACTS_UNVERIFIED: {
    category: 'platform',
    score: 1,
    title: 'Some platform contracts are unverified',
    explanation:
      'Code running in a particular address is not public by default. Block explorers let developers verify the code behind that address. This is a good practice because it lets other developers audit the code and confirm that it does what it’s supposed to. Some of the third party contracts that this vault uses are not verified. This means that there are certain things that the Beefy devs have not been able to inspect.',
    condition: '',
  },

  ADMIN_WITH_TIMELOCK: {
    category: 'platform',
    score: 0,
    title: 'Dangerous functions behind a timelock',
    explanation:
      'In some platforms the owner or admin can execute certain functions that could put user funds in jeopardy. The best thing is to avoid these features altogether. If they must be present, it’s important to keep them behind a timelock to give proper warning to users before using them. This vault interacts with a platform that has certain dangerous admin functions, but they are at least behind a meaningful timelock.',
    condition:
      'There is at least one function present that could partially or completely rug user funds. The function must be behind a +6h timelock.',
  },

  ADMIN_WITHOUT_TIMELOCK: {
    category: 'platform',
    score: 0.5,
    title: 'Dangerous functions without a timelock',
    explanation:
      'In some platforms the owner or admin can execute certain functions that could put user funds in jeopardy. The best thing is to avoid these features altogether. If they must be present, it’s important to keep them behind a timelock to give proper warning to users before using them. This vault interacts with a platform that has certain dangerous admin functions, and there is no time lock present. They can be executed at a moment’s notice.',
    condition:
      'There is at least one function present that could partially or completely rug user funds. The function has no time lock protection.',
  },
};

export const CATEGORIES = {
  beefy: 0.2,
  asset: 0.2,
  platform: 0.6,
};
