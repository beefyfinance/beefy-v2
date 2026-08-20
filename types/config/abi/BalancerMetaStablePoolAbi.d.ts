export declare const BalancerMetaStablePoolAbi: readonly [{
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IVault";
            readonly name: "vault";
            readonly type: "address";
        }, {
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
            readonly internalType: "contract IRateProvider[]";
            readonly name: "rateProviders";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "priceRateCacheDuration";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "uint256";
            readonly name: "amplificationParameter";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "swapFeePercentage";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "pauseWindowDuration";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "bufferPeriodDuration";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "oracleEnabled";
            readonly type: "bool";
        }, {
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }];
        readonly internalType: "struct MetaStablePool.NewPoolParams";
        readonly name: "params";
        readonly type: "tuple";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "startValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "endValue";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "startTime";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "endTime";
        readonly type: "uint256";
    }];
    readonly name: "AmpUpdateStarted";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "currentValue";
        readonly type: "uint256";
    }];
    readonly name: "AmpUpdateStopped";
    readonly type: "event";
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
        readonly name: "enabled";
        readonly type: "bool";
    }];
    readonly name: "OracleEnabledChanged";
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
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "rate";
        readonly type: "uint256";
    }];
    readonly name: "PriceRateCacheUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "contract IRateProvider";
        readonly name: "provider";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "cacheDuration";
        readonly type: "uint256";
    }];
    readonly name: "PriceRateProviderSet";
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
    readonly name: "enableOracle";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
    readonly name: "getAmplificationParameter";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "bool";
        readonly name: "isUpdating";
        readonly type: "bool";
    }, {
        readonly internalType: "uint256";
        readonly name: "precision";
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
    readonly name: "getLargestSafeQueryWindow";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getLastInvariant";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "lastInvariant";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastInvariantAmp";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "enum IPriceOracle.Variable";
        readonly name: "variable";
        readonly type: "uint8";
    }];
    readonly name: "getLatest";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getOracleMiscData";
    readonly outputs: readonly [{
        readonly internalType: "int256";
        readonly name: "logInvariant";
        readonly type: "int256";
    }, {
        readonly internalType: "int256";
        readonly name: "logTotalSupply";
        readonly type: "int256";
    }, {
        readonly internalType: "uint256";
        readonly name: "oracleSampleCreationTimestamp";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "oracleIndex";
        readonly type: "uint256";
    }, {
        readonly internalType: "bool";
        readonly name: "oracleEnabled";
        readonly type: "bool";
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
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "enum IPriceOracle.Variable";
            readonly name: "variable";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "ago";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IPriceOracle.OracleAccumulatorQuery[]";
        readonly name: "queries";
        readonly type: "tuple[]";
    }];
    readonly name: "getPastAccumulators";
    readonly outputs: readonly [{
        readonly internalType: "int256[]";
        readonly name: "results";
        readonly type: "int256[]";
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
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "getPriceRateCache";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "rate";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "expires";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getRate";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getRateProviders";
    readonly outputs: readonly [{
        readonly internalType: "contract IRateProvider[]";
        readonly name: "providers";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "index";
        readonly type: "uint256";
    }];
    readonly name: "getSample";
    readonly outputs: readonly [{
        readonly internalType: "int256";
        readonly name: "logPairPrice";
        readonly type: "int256";
    }, {
        readonly internalType: "int256";
        readonly name: "accLogPairPrice";
        readonly type: "int256";
    }, {
        readonly internalType: "int256";
        readonly name: "logBptPrice";
        readonly type: "int256";
    }, {
        readonly internalType: "int256";
        readonly name: "accLogBptPrice";
        readonly type: "int256";
    }, {
        readonly internalType: "int256";
        readonly name: "logInvariant";
        readonly type: "int256";
    }, {
        readonly internalType: "int256";
        readonly name: "accLogInvariant";
        readonly type: "int256";
    }, {
        readonly internalType: "uint256";
        readonly name: "timestamp";
        readonly type: "uint256";
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
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "enum IPriceOracle.Variable";
            readonly name: "variable";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "secs";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "ago";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IPriceOracle.OracleAverageQuery[]";
        readonly name: "queries";
        readonly type: "tuple[]";
    }];
    readonly name: "getTimeWeightedAverage";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "results";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getTotalSamples";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "pure";
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
        readonly name: "amountsOut";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "dueProtocolFeeAmounts";
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
        readonly name: "amountsIn";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "dueProtocolFeeAmounts";
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
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "indexIn";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "indexOut";
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
        readonly internalType: "bool";
        readonly name: "paused";
        readonly type: "bool";
    }];
    readonly name: "setPaused";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }];
    readonly name: "setPriceRateCacheDuration";
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
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "rawEndValue";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "endTime";
        readonly type: "uint256";
    }];
    readonly name: "startAmplificationParameterUpdate";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "stopAmplificationParameterUpdate";
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
    readonly inputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "updatePriceRateCache";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
