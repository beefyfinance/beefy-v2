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
  'WBTCe',
  'WETHe',
  'BTC',
  'WBTC',
  'WETH',
  'ETH',
  'BNB',
  'DOT',
  'UNI',
  'YFI',
  'LINK',
  'AAVE',
  'SUSHI',
  'LTC',
  'MKR',
  'ATOM',
  'COMP',
  'SNX',
  'BIFI',
  'sarETH', //Stargate Arbitrum ETH
  'soETH', //Stargate Optimism ETH
  'sethETH', //Stargate Ethereum ETH
  'multiBTC',
  'sBTC',
  'BTCB',
  'AVAX',
  'BTCb',
  'tBTC', // trehshodl BTC
  'axlWBTC', //axelar WBTC
  'axlETH', // axelar eth
  'wstETH', // lido staked eth
  'stETH', // lido eth
  'rETH', // rocketpool eth
  'WETHwh', // wormhole ETH
  'WBTCwh', // wormhole WBTC
];
