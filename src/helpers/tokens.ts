import { isTokenEqual, type TokenEntity } from '../features/data/entities/token';
import { uniqBy } from 'lodash-es';

export function uniqueTokens<T extends TokenEntity>(tokens: T[]): T[] {
  return uniqBy(tokens, token => `${token.chainId}-${token.address}`);
}

export function checkAddressOrder(addresses: string[]) {
  if (addresses.length === 0) {
    throw new Error('No addresses provided');
  }

  const addressesLower = addresses.map(a => a.toLowerCase());
  const sorted = [...addressesLower].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== addressesLower[i]) {
      throw new Error('Addresses are not in order');
    }
  }
}

export function tokenInList<T extends TokenEntity>(token: T, list: T[]): boolean {
  return list.some(t => isTokenEqual(t, token));
}

export function getTokenSymbolWithLpTag(token: TokenEntity): {
  symbol: string;
  tag: string | undefined;
} {
  const symbol = token.symbol;
  if (symbol.endsWith('rCLM')) {
    return { symbol: symbol.replace('rCLM', ''), tag: 'rCLM' };
  }

  if (symbol.endsWith('CLM')) {
    return { symbol: symbol.replace('CLM', ''), tag: 'CLM' };
  }

  if (symbol.endsWith('LP')) {
    return { symbol: symbol.replace('LP', ''), tag: 'LP' };
  }

  if (symbol.endsWith('sLP')) {
    return { symbol: symbol.replace('sLP', ''), tag: 'sLP' };
  }

  if (symbol.endsWith('vLP')) {
    return { symbol: symbol.replace('vLP', ''), tag: 'vLP' };
  }

  return { symbol, tag: undefined };
}
