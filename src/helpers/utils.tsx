let trimReg = /(^\s*)|(\s*$)/g;

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
    for (let i in key) {
      return false;
    }
    return true;
  } else if (typeof key == 'boolean') {
    return false;
  }
}

/**
 * I am using this function: https://stackoverflow.com/a/16436975
 * It is important to only compare arrays of the same basic type. For example,
 * an array of numbers or an array of strings, but not an array of objects!
 * @param a Array<T>
 * @param b Array<T>
 * @returns a boolean indicating if those two arrays are equal or not
 */
export function areArraysEqual<T>(a: Array<T>, b: Array<T>) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
  'SOL',
  'LTC',
  'MKR',
  'ATOM',
  'COMP',
  'SNX',
  'BIFI',
  'sarETH', //Stargate Arbitrum ETH
  'soETH', //Stargate Optimism ETH
  'sethETH', //Stargate Ethereum ETH
];
