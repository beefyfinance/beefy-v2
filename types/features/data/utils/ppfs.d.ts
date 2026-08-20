import BigNumber from 'bignumber.js';
import type { TokenEntity } from '../entities/token';
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
export declare function mooAmountToOracleAmount(mooToken: TokenEntity, depositToken: TokenEntity, ppfs: BigNumber, mooTokenAmount: BigNumber): BigNumber;
export declare function oracleAmountToMooAmount(mooToken: TokenEntity, depositToken: TokenEntity, ppfs: BigNumber, depositTokenAmount: BigNumber): BigNumber;
