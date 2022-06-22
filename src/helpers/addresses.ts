const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function isZeroAddress(address: string) {
  return address === ZERO_ADDRESS;
}
