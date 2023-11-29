import { BigNumber } from 'bignumber.js';
import { isBigNumber } from './big-number';
import { cloneDeepWith } from 'lodash-es';

export function cloneDeep<T>(input: T): T {
  return cloneDeepWith(input, value => {
    if (isBigNumber(value)) {
      return new BigNumber(value);
    }
    // Return undefined to let lodash handle cloning
    return undefined;
  });
}
