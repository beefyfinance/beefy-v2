import type { TokenAmount } from '../transact-types';
import type { TokenEntity } from '../../../entities/token';
import BigNumber from 'bignumber.js';
export declare function tokenAmountToWei(tokenAmount: TokenAmount): BigNumber;
export declare function slipBy(amount: BigNumber, slippage: number, decimals: number): BigNumber;
export declare function slipTokenAmountBy(tokenAmount: TokenAmount, slippage: number): TokenAmount;
export declare function slipAllBy(inputs: TokenAmount[], slippage: number): TokenAmount[];
/** Excess that arrives on dest when the full (unslipped) amount crosses the bridge, adjusted for proportional fees */
export declare function bridgeSlippageReturned(expectedAmount: BigNumber, slippedAmount: BigNumber, bridgeQuote: {
    toAmount: BigNumber;
    fromAmount: BigNumber;
}, destToken: TokenEntity): TokenAmount | undefined;
export declare function mergeTokenAmounts(...tokenAmounts: TokenAmount[][]): TokenAmount[];
