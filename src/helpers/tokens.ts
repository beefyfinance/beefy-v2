import { TokenEntity } from '../features/data/entities/token';
import { uniqBy } from 'lodash';

export function uniqueTokens<T extends TokenEntity>(tokens: T[]): T[] {
  return uniqBy(tokens, token => `${token.chainId}-${token.address}`);
}
