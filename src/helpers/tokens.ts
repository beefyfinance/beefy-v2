import { isTokenEqual, type TokenEntity } from '../features/data/entities/token';
import { uniqBy } from 'lodash-es';
import type { VaultEntity } from '../features/data/entities/vault';

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

export function symbolToLabelAndTag(symbol: string): { label: string; tag: string | undefined } {
  const match = symbol.match(/ (?<tag>LP|sLP|vLP|CLM|rCLM|mooCLM)\b/);
  const tag = match?.groups?.tag;
  if (tag) {
    return {
      label: symbol.replace(` ${tag}`, '').replace(/ +/, ' ').trim(),
      tag,
    };
  }
  return { label: symbol, tag: undefined };
}

export function extractTagFromLpSymbol(
  tokens: TokenEntity[],
  vault: VaultEntity
): {
  tokens: TokenEntity[];
  tag: string | undefined;
} {
  if (tokens.length === 1) {
    const token = tokens[0];
    const labelTag = symbolToLabelAndTag(token.symbol);
    const label = labelTag.label;
    let tag = labelTag.tag;

    if (
      !tag &&
      vault.assetType !== 'single' &&
      token.address === vault.depositTokenAddress &&
      token.chainId === vault.chainId
    ) {
      tag = 'LP';
    }

    if (tag) {
      return {
        tokens: token.symbol === label ? tokens : [{ ...token, symbol: label }],
        tag,
      };
    }
  }

  return { tokens, tag: undefined };
}
