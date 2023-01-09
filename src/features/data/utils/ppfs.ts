import BigNumber from 'bignumber.js';
import { TokenEntity } from '../entities/token';

/**
 * ppfs applies to "chain" representation of numbers
 * in the app, we use "math" representation because it's intuitive
 * and takes decimals into account.
 * Chain representation needs the token decimals to be interpreted
 *
 * Ex:
 *  - math number: 0.0006
 *  - chain representation:
 *     - 8 decimals: "00060000"
 *     - 18 decimals: "000600000000000000"
 *
 * For some reason, price per full share only works with chain representation
 */

export function mooAmountToOracleAmount(
  mooToken: TokenEntity,
  depositToken: TokenEntity,
  ppfs: BigNumber,
  mooTokenAmount: BigNumber
) {
  // go to chain representation
  const mooChainAmount = mooTokenAmount.shiftedBy(mooToken.decimals);

  // convert to oracle amount in chain representation
  const oracleChainAmount = mooChainAmount.multipliedBy(ppfs);

  // go to math representation
  // but we can't return a number with more precision than the oracle precision
  const oracleAmount = oracleChainAmount
    .shiftedBy(-depositToken.decimals)
    .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);

  return oracleAmount;
}

export function oracleAmountToMooAmount(
  mooToken: TokenEntity,
  depositToken: TokenEntity,
  ppfs: BigNumber,
  depositTokenAmount: BigNumber
) {
  // go to chain representation
  const oracleChainAmount = depositTokenAmount.shiftedBy(depositToken.decimals);

  // convert to moo amount in chain representation
  const mooChainAmount = oracleChainAmount.dividedBy(ppfs);

  // go to math representation
  // but we can't return a number with more precision than the oracle precision
  const mooAmount = mooChainAmount
    .shiftedBy(-mooToken.decimals)
    .decimalPlaces(mooToken.decimals, BigNumber.ROUND_FLOOR);

  return mooAmount;
}
