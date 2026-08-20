import type BigNumber from 'bignumber.js';
export declare class WeightedMath {
    private constructor();
    /** balances must be correctly (up)scaled */
    static calcAllTokensInGivenExactBptOut(balances: BigNumber[], bptOut: BigNumber, totalSupply: BigNumber): BigNumber[];
    /** balances must be correctly (up)scaled */
    static calcTokensOutGivenExactBptIn(balances: BigNumber[], bptIn: BigNumber, totalSupply: BigNumber): BigNumber[];
}
