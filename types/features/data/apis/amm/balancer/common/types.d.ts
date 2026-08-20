import type BigNumber from 'bignumber.js';
export declare enum PoolJoinKind {
    INIT = 0,
    EXACT_TOKENS_IN_FOR_BPT_OUT = 1,
    TOKEN_IN_FOR_EXACT_BPT_OUT = 2,
    ALL_TOKENS_IN_FOR_EXACT_BPT_OUT = 3
}
export declare enum PoolExitKind {
    EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
    EXACT_BPT_IN_FOR_TOKENS_OUT = 1,
    BPT_IN_FOR_EXACT_TOKENS_OUT = 2
}
type JoinInit = {
    /** Generic PoolJoinKind */
    kind: PoolJoinKind.INIT;
    /** Pool specific uint256 that represents the generic JoinKind */
    kindValue: number;
    initialBalances: BigNumber[];
};
type JoinExactTokensInForBPTOut = {
    kind: PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT;
    kindValue: number;
    tokensIn: string[];
    amountsIn: BigNumber[];
    minimumBPT: BigNumber;
};
type JoinTokenInForExactBPTOut = {
    kind: PoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT;
    kindValue: number;
    bptAmountOut: BigNumber;
    enterTokenIndex: number;
};
type JoinAllTokensInForExactBPTOut = {
    kind: PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT;
    kindValue: number;
    bptAmountOut: BigNumber;
};
export type JoinPoolUserData = JoinInit | JoinExactTokensInForBPTOut | JoinTokenInForExactBPTOut | JoinAllTokensInForExactBPTOut;
type ExitExactBPTInForOneTokenOut = {
    kind: PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT;
    kindValue: number;
    bptAmountIn: BigNumber;
    exitTokenIndex: number;
};
type ExitExactBPTInForTokensOut = {
    kind: PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT;
    kindValue: number;
    bptAmountIn: BigNumber;
};
type ExitBPTInForExactTokensOut = {
    kind: PoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT;
    kindValue: number;
    tokensOut: string[];
    amountsOut: BigNumber[];
    maxBPTAmountIn: BigNumber;
};
export type ExitPoolUserData = ExitExactBPTInForOneTokenOut | ExitExactBPTInForTokensOut | ExitBPTInForExactTokensOut;
export {};
