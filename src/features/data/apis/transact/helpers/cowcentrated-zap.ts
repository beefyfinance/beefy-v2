import { getInsertIndex } from './zap.ts';

const B20_TOKEN_ADDRESS_PREFIX = '0xb200000000000000000000';

export function isB20TokenAddress(address: string): boolean {
  return address.toLowerCase().startsWith(B20_TOKEN_ADDRESS_PREFIX);
}

export function getCowcentratedDepositTokenInsertIndex(
  token: string,
  depositArgumentPosition: 0 | 1,
  insertBalance: boolean
): number {
  if (!insertBalance) {
    return -1;
  }

  if (depositArgumentPosition === 1 && isB20TokenAddress(token)) {
    return -1;
  }

  return getInsertIndex(depositArgumentPosition);
}
