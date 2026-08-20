export declare const BalancerWeightedPoolAbi: readonly [{
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "string";
            readonly name: "name";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "symbol";
            readonly type: "string";
        }, {
            readonly internalType: "contract IERC20[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "normalizedWeights";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "contract IRateProvider[]";
            readonly name: "rateProviders";
            readonly type: "address[]";
        }, {
            readonly internalType: "address[]";
            readonly name: "assetManagers";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256";
            readonly name: "swapFeePercentage";
            readonly type: "uint256";
        }];
        readonly internalType: "struct WeightedPool.NewPoolParams";
        readonly name: "params";
        readonly type: "tuple";
    }, {
        readonly internalType: "contract IVault";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "contract IProtocolFeePercentagesProvider";
        readonly name: "protocolFeeProvider";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "pauseWindowDuration";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "bufferPeriodDuration";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "string";
        readonly name: "version";
        readonly type: "string";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "paused";
        readonly type: "bool";
    }];
    readonly name: "PausedStateChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "feeType";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "protocolFeePercentage";
        readonly type: "uint256";
    }];
    readonly name: "ProtocolFeePercentageCacheUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "enabled";
        readonly type: "bool";
    }];
    readonly name: "RecoveryModeStateChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "swapFeePercentage";
        readonly type: "uint256";
    }];
    readonly name: "SwapFeePercentageChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Transfer";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DELEGATE_PROTOCOL_SWAP_FEES_SENTINEL";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "allowance";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "decreaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "disableRecoveryMode";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "enableRecoveryMode";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getATHRateProduct";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes4";
        readonly name: "selector";
        readonly type: "bytes4";
    }];
    readonly name: "getActionId";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getActualSupply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getAuthorizer";
    readonly outputs: readonly [{
        readonly internalType: "contract IAuthorizer";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getDomainSeparator";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getInvariant";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getLastPostJoinExitInvariant";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getNextNonce";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getNormalizedWeights";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getOwner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getPausedState";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "paused";
        readonly type: "bool";
    }, {
        readonly internalType: "uint256";
        readonly name: "pauseWindowEndTime";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "bufferPeriodEndTime";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getPoolId";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "feeType";
        readonly type: "uint256";
    }];
    readonly name: "getProtocolFeePercentageCache";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getProtocolFeesCollector";
    readonly outputs: readonly [{
        readonly internalType: "contract IProtocolFeesCollector";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getProtocolSwapFeeDelegation";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getRateProviders";
    readonly outputs: readonly [{
        readonly internalType: "contract IRateProvider[]";
        readonly name: "";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getScalingFactors";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getSwapFeePercentage";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getVault";
    readonly outputs: readonly [{
        readonly internalType: "contract IVault";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "inRecoveryMode";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "addedValue";
        readonly type: "uint256";
    }];
    readonly name: "increaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "nonces";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
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
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastChangeBlock";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "protocolSwapFeePercentage";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "userData";
        readonly type: "bytes";
    }];
    readonly name: "onExitPool";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "";
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
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastChangeBlock";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "protocolSwapFeePercentage";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "userData";
        readonly type: "bytes";
    }];
    readonly name: "onJoinPool";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "enum IVault.SwapKind";
            readonly name: "kind";
            readonly type: "uint8";
        }, {
            readonly internalType: "contract IERC20";
            readonly name: "tokenIn";
            readonly type: "address";
        }, {
            readonly internalType: "contract IERC20";
            readonly name: "tokenOut";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "poolId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "lastChangeBlock";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "userData";
            readonly type: "bytes";
        }];
        readonly internalType: "struct IPoolSwapStructs.SwapRequest";
        readonly name: "request";
        readonly type: "tuple";
    }, {
        readonly internalType: "uint256";
        readonly name: "balanceTokenIn";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "balanceTokenOut";
        readonly type: "uint256";
    }];
    readonly name: "onSwap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "pause";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "v";
        readonly type: "uint8";
    }, {
        readonly internalType: "bytes32";
        readonly name: "r";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
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
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastChangeBlock";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "protocolSwapFeePercentage";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "userData";
        readonly type: "bytes";
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
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastChangeBlock";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "protocolSwapFeePercentage";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "userData";
        readonly type: "bytes";
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
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "poolConfig";
        readonly type: "bytes";
    }];
    readonly name: "setAssetManagerPoolConfig";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "swapFeePercentage";
        readonly type: "uint256";
    }];
    readonly name: "setSwapFeePercentage";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "symbol";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "totalSupply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transfer";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "unpause";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "updateProtocolFeePercentageCache";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "version";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
