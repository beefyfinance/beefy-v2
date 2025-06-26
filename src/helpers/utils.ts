export function isEmpty(value: unknown) {
  if (value === undefined || value === '' || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    value = value.trim();
    return value === '' || value === 'null' || value === 'undefined';
  } else if (typeof value === 'undefined') {
    return true;
  } else if (typeof value === 'object') {
    for (const _ in value) {
      return false;
    }
    return true;
  } else if (typeof value === 'boolean') {
    return false;
  }

  return false;
}

export const bluechipTokens = [
  'BTC',
  'WBTC',
  'ETH',
  'WETH',
  'LTC',
  'ATOM',
  'AVAX',
  'WAVAX',
  'BNB',
  'WBNB',
  'DOT',
  'xcDOT',
  'FTM',
  'WFTM',
  'MATIC',
  'WMATIC',
  'SOL',
  'UNI',
  'YFI',
  'LINK',
  'AAVE',
  'SUSHI',
  'MKR',
  'COMP',
  'SNX',
  'CRV',
  'GNO',
  'LDO',
  'ENS',
  'BIFI',
  'mooBIFI',
  'WBTCe',
  'BTCB',
  'BTCb',
  'tBTC', // Treshold BTC
  'WETHe',
  'wstETH', // Lido Wrapped Staked ETH
  'stETH', // Lido Staked ETH
  'rETH', // Rocket Pool Staked ETH
  'cbETH', // Coinbase Staked ETH
  'sarETH', //Stargate Arbitrum ETH
  'soETH', //Stargate Optimism ETH
  'sethETH', //Stargate Ethereum ETH
  'ADA',
  'XRP',
  'ARB',
  'OP',
  'BAL',
  'S',
  'WS',
  'POL',
  'WPOL',
  'MORPHO',
  'OHM',
  'PENDLE',
  'ZRO',
  'eBTC',
  'sAVAX',
  'slisBNB',
  'waArbWBTC',
  'waArbWETH',
  'waArbwstETH',
  'waAvaSAVAX',
  'waAvaWAVAX',
  'waAvaWETH',
  'waBasWETH',
  'waBaswstETH',
  'waEthLidoWETH',
  'waEthLidowstETH',
  'wagETH',
  'wagGNO',
  'wagwstETH',
  'weETH',
  'xcDOT',
];

export const memeTokens = [
  'AIFUN',
  'AIXBT',
  'ANIME',
  'ANON',
  'B',
  'B3',
  'BRETT',
  'Base is for everyone',
  'Broccoli',
  'BroccoliCZDog',
  'CHAD',
  'CHAMP',
  'CHAOS',
  'CHOMP',
  'CLANKER',
  'DOG',
  'DOGE',
  'DRB',
  'FAI',
  'FCAST',
  'GHST',
  'GRK',
  'HIGHER',
  'HPC',
  'HarryPotterObamaSonic10Inu',
  'KEYCAT',
  'L2VE',
  'LRDS',
  'LUDWIG',
  'LUM',
  'LUNA',
  'MIGGLES',
  'MOR',
  'MOXIE',
  'Mog',
  'noice',
  'NORMILIO',
  'NORMUS',
  'NPC',
  'OVER',
  'OwO',
  'PARADOX',
  'PEPE',
  'PiP',
  'POPCAT',
  'PURR',
  'REI',
  'SHELL',
  'SHIB',
  'SIMMI',
  'SIREN',
  'SPEC',
  'SPX',
  'TOSHI',
  'TST',
  'TUT',
  'TYBG',
  'WIF',
  'doginme',
  'mfer',
  'mubarak',
  'uDOGE',
  'uPEPE',
  'uSHIB',
  'wBaseDOGE',
];
