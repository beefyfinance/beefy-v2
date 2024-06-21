const trimReg = /(^\s*)|(\s*$)/g;

export function isEmpty(key) {
  if (key === undefined || key === '' || key === null) {
    return true;
  }
  if (typeof key === 'string') {
    key = key.replace(trimReg, '');
    return key === '' || key === null || key === 'null' || key === undefined || key === 'undefined';
  } else if (typeof key === 'undefined') {
    return true;
  } else if (typeof key == 'object') {
    for (const i in key) {
      return false;
    }
    return true;
  } else if (typeof key == 'boolean') {
    return false;
  }
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
