import BigNumber from 'bignumber.js';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function web3BNToFloatString(bn, divideBy, decimals, roundingMode = BigNumber.ROUND_DOWN) {
  const converted = new BigNumber(bn.toString());
  const divided = converted.div(divideBy);
  return divided.toFixed(decimals, roundingMode);
}
