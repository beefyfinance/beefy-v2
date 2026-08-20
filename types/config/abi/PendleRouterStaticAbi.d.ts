/**
 * Minimal ABI for Pendle's Router Static helper (PendleRouterStatic) used purely
 * for off-chain quoting via eth_call — it mirrors the router actions as view
 * functions so we can estimate LP out / token out without the SDK.
 *
 * Mainnet address: 0x263833d47eA3fA4a30f269323aba6a107f9eB14C
 *
 * Only the first return value of each function is used by the zap
 * (netLpOut / netTokenOut); the remaining values are kept for correct decoding.
 */
export declare const PendleRouterStaticAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "market";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "tokenIn";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "netTokenIn";
        readonly type: "uint256";
    }];
    readonly name: "addLiquiditySingleTokenStatic";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "netLpOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netPtFromSwap";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "priceImpact";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "exchangeRateAfter";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyMinted";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyToSwap";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "market";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "netLpToRemove";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "tokenOut";
        readonly type: "address";
    }];
    readonly name: "removeLiquiditySingleTokenStatic";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "netTokenOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "priceImpact";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "exchangeRateAfter";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
