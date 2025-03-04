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
];
