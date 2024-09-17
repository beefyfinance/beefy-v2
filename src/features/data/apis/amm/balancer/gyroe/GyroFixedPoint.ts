import { BIG_ONE, BIG_ZERO } from '../../../../../../helpers/big-number';
import BigNumber from 'bignumber.js';

export class GyroFixedPoint {
  public static readonly ONE = BIG_ONE.shiftedBy(18);

  private constructor() {
    // static only
  }

  static mulDown(a: BigNumber, b: BigNumber): BigNumber {
    const product = a.multipliedBy(b).integerValue(BigNumber.ROUND_FLOOR);
    if (!(a.isZero() || product.dividedToIntegerBy(a).isEqualTo(b))) {
      throw new Error('Multiplication overflow');
    }
    return product.dividedToIntegerBy(GyroFixedPoint.ONE);
  }

  static mulUp(a: BigNumber, b: BigNumber): BigNumber {
    const product = a.multipliedBy(b).integerValue(BigNumber.ROUND_FLOOR);
    if (!(a.isZero() || product.dividedToIntegerBy(a).isEqualTo(b))) {
      throw new Error('Multiplication overflow');
    }

    if (product.isZero()) {
      return product;
    }

    return product.minus(1).dividedToIntegerBy(GyroFixedPoint.ONE).plus(1);
  }

  static divDown(a: BigNumber, b: BigNumber): BigNumber {
    if (b.isZero()) {
      throw new Error('Division by zero');
    }

    if (a.isZero()) {
      return BIG_ZERO;
    }

    const aInflated = a.multipliedBy(GyroFixedPoint.ONE);
    if (!aInflated.dividedToIntegerBy(a).isEqualTo(GyroFixedPoint.ONE)) {
      throw new Error('Multiplication overflow');
    }

    return aInflated.dividedToIntegerBy(b);
  }

  static divUp(a: BigNumber, b: BigNumber): BigNumber {
    if (b.isZero()) {
      throw new Error('Division by zero');
    }

    if (a.isZero()) {
      return BIG_ZERO;
    }

    const aInflated = a.multipliedBy(GyroFixedPoint.ONE);
    if (!aInflated.dividedToIntegerBy(a).isEqualTo(GyroFixedPoint.ONE)) {
      throw new Error('Multiplication overflow');
    }

    return aInflated.minus(1).dividedToIntegerBy(b).plus(1);
  }
}
