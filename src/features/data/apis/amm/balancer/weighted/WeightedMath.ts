import type BigNumber from 'bignumber.js';
import { FixedPoint } from '../common/FixedPoint.ts';

export class WeightedMath {
  private constructor() {
    // static only
  }

  /** balances must be correctly (up)scaled */
  static calcAllTokensInGivenExactBptOut(
    balances: BigNumber[],
    bptOut: BigNumber,
    totalSupply: BigNumber
  ): BigNumber[] {
    return balances.map(balance =>
      FixedPoint.divUp(FixedPoint.mulUp(balance, bptOut), totalSupply)
    );
  }

  /** balances must be correctly (up)scaled */
  static calcTokensOutGivenExactBptIn(
    balances: BigNumber[],
    bptIn: BigNumber,
    totalSupply: BigNumber
  ): BigNumber[] {
    return balances.map(balance =>
      FixedPoint.divDown(FixedPoint.mulDown(balance, bptIn), totalSupply)
    );
  }
}
