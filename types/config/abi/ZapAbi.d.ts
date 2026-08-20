export declare const ZapAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "beefyVault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "tokenAmountOutMin";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "tokenIn";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "tokenInAmount";
        readonly type: "uint256";
    }];
    readonly name: "beefIn";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "beefyVault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "tokenAmountOutMin";
        readonly type: "uint256";
    }];
    readonly name: "beefInETH";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "beefyVault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "withdrawAmount";
        readonly type: "uint256";
    }];
    readonly name: "beefOut";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "beefyVault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "withdrawAmount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "desiredToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "desiredTokenOutMin";
        readonly type: "uint256";
    }];
    readonly name: "beefOutAndSwap";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "checkWETH";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "isValid";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "beefyVault";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "tokenIn";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "fullInvestmentIn";
        readonly type: "uint256";
    }];
    readonly name: "estimateSwap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "swapAmountIn";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "swapAmountOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "swapTokenOut";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IBeefyVault";
        readonly name: "beefyVault";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "desiredToken";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "withdrawAmount";
        readonly type: "uint256";
    }];
    readonly name: "estimateSwapOut";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "swapAmountIn";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "swapAmountOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "swapTokenIn";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "minimumAmount";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "router";
    readonly outputs: readonly [{
        readonly internalType: "contract IUniswapV2Router02";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
