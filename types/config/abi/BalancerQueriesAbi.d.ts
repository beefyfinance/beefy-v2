export declare const BalancerQueriesAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract IVault";
        readonly name: "_vault";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [{
        readonly internalType: "enum IVault.SwapKind";
        readonly name: "kind";
        readonly type: "uint8";
    }, {
        readonly components: readonly [{
            readonly internalType: "bytes32";
            readonly name: "poolId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "assetInIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "assetOutIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "userData";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IVault.BatchSwapStep[]";
        readonly name: "swaps";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "contract IAsset[]";
        readonly name: "assets";
        readonly type: "address[]";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "fromInternalBalance";
            readonly type: "bool";
        }, {
            readonly internalType: "address payable";
            readonly name: "recipient";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "toInternalBalance";
            readonly type: "bool";
        }];
        readonly internalType: "struct IVault.FundManagement";
        readonly name: "funds";
        readonly type: "tuple";
    }];
    readonly name: "queryBatchSwap";
    readonly outputs: readonly [{
        readonly internalType: "int256[]";
        readonly name: "assetDeltas";
        readonly type: "int256[]";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly internalType: "contract IAsset[]";
            readonly name: "assets";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "minAmountsOut";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "bytes";
            readonly name: "userData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bool";
            readonly name: "toInternalBalance";
            readonly type: "bool";
        }];
        readonly internalType: "struct IVault.ExitPoolRequest";
        readonly name: "request";
        readonly type: "tuple";
    }];
    readonly name: "queryExit";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "bptIn";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "amountsOut";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly internalType: "contract IAsset[]";
            readonly name: "assets";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "maxAmountsIn";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "bytes";
            readonly name: "userData";
            readonly type: "bytes";
        }, {
            readonly internalType: "bool";
            readonly name: "fromInternalBalance";
            readonly type: "bool";
        }];
        readonly internalType: "struct IVault.JoinPoolRequest";
        readonly name: "request";
        readonly type: "tuple";
    }];
    readonly name: "queryJoin";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "bptOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "amountsIn";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "bytes32";
            readonly name: "poolId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "enum IVault.SwapKind";
            readonly name: "kind";
            readonly type: "uint8";
        }, {
            readonly internalType: "contract IAsset";
            readonly name: "assetIn";
            readonly type: "address";
        }, {
            readonly internalType: "contract IAsset";
            readonly name: "assetOut";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "userData";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IVault.SingleSwap";
        readonly name: "singleSwap";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "fromInternalBalance";
            readonly type: "bool";
        }, {
            readonly internalType: "address payable";
            readonly name: "recipient";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "toInternalBalance";
            readonly type: "bool";
        }];
        readonly internalType: "struct IVault.FundManagement";
        readonly name: "funds";
        readonly type: "tuple";
    }];
    readonly name: "querySwap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "vault";
    readonly outputs: readonly [{
        readonly internalType: "contract IVault";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
