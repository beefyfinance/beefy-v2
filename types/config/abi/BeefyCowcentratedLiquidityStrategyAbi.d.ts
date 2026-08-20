export declare const BeefyCowcentratedLiquidityStrategyAbi: readonly [{
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }];
    readonly name: "AddressEmptyCode";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "AddressInsufficientBalance";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "FailedInnerCall";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidEntry";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidInput";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidOutput";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotAuthorized";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotCalm";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotManager";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotPool";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotStrategist";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotVault";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "OverLimit";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "SafeERC20FailedOperation";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "StrategyPaused";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "TooMuchSlippage";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "callFeeAmount";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "beefyFeeAmount";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "strategistFeeAmount";
        readonly type: "uint256";
    }];
    readonly name: "ChargedFees";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeMain0";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeMain1";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeAlt0";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeAlt1";
        readonly type: "uint256";
    }];
    readonly name: "ClaimedFees";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "bal0";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "bal1";
        readonly type: "uint256";
    }];
    readonly name: "Deposit";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "fee0";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "fee1";
        readonly type: "uint256";
    }];
    readonly name: "Harvest";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "version";
        readonly type: "uint8";
    }];
    readonly name: "Initialized";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "previousOwner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "OwnershipTransferred";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "Paused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "int56";
        readonly name: "maxTickDeviation";
        readonly type: "int56";
    }];
    readonly name: "SetDeviation";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "path";
        readonly type: "bytes";
    }];
    readonly name: "SetLpToken0ToNativePath";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "path";
        readonly type: "bytes";
    }];
    readonly name: "SetLpToken1ToNativePath";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "int24";
        readonly name: "oldWidth";
        readonly type: "int24";
    }, {
        readonly indexed: false;
        readonly internalType: "int24";
        readonly name: "width";
        readonly type: "int24";
    }];
    readonly name: "SetPositionWidth";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "quoter";
        readonly type: "address";
    }];
    readonly name: "SetQuoter";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeId";
        readonly type: "uint256";
    }];
    readonly name: "SetStratFeeId";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "strategist";
        readonly type: "address";
    }];
    readonly name: "SetStrategist";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint32";
        readonly name: "oldInterval";
        readonly type: "uint32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint32";
        readonly name: "interval";
        readonly type: "uint32";
    }];
    readonly name: "SetTwapInterval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "unirouter";
        readonly type: "address";
    }];
    readonly name: "SetUnirouter";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "Unpaused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "bal0";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "bal1";
        readonly type: "uint256";
    }];
    readonly name: "Withdraw";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "balances";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "token0Bal";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "token1Bal";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "balancesOfPool";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "token0Bal";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "token1Bal";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "mainAmount0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "mainAmount1";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "altAmount0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "altAmount1";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "balancesOfThis";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "token0Bal";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "token1Bal";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "beefyFeeConfig";
    readonly outputs: readonly [{
        readonly internalType: "contract IFeeConfig";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "beefyFeeRecipient";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "beforeAction";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "claimEarnings";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "fee0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "fee1";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "feeAlt0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "feeAlt1";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "currentTick";
    readonly outputs: readonly [{
        readonly internalType: "int24";
        readonly name: "tick";
        readonly type: "int24";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "deposit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "depositFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "factory";
    readonly outputs: readonly [{
        readonly internalType: "contract IStrategyFactory";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "fees0";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "fees1";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getAllFees";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "total";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "beefy";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "call";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "strategist";
                readonly type: "uint256";
            }, {
                readonly internalType: "string";
                readonly name: "label";
                readonly type: "string";
            }, {
                readonly internalType: "bool";
                readonly name: "active";
                readonly type: "bool";
            }];
            readonly internalType: "struct IFeeConfig.FeeCategory";
            readonly name: "performance";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "deposit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "withdraw";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IFeeConfig.AllFees";
        readonly name: "";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getKeys";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "keyMain";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "keyAlt";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getStratFeeId";
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
        readonly name: "_callFeeRecipient";
        readonly type: "address";
    }];
    readonly name: "harvest";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "harvest";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_pool";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_quoter";
        readonly type: "address";
    }, {
        readonly internalType: "int24";
        readonly name: "_positionWidth";
        readonly type: "int24";
    }, {
        readonly internalType: "bytes";
        readonly name: "_lpToken0ToNativePath";
        readonly type: "bytes";
    }, {
        readonly internalType: "bytes";
        readonly name: "_lpToken1ToNativePath";
        readonly type: "bytes";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "vault";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "unirouter";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "strategist";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "factory";
            readonly type: "address";
        }];
        readonly internalType: "struct StratFeeManagerInitializable.CommonAddresses";
        readonly name: "_commonAddresses";
        readonly type: "tuple";
    }];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "isCalm";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "keeper";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lastHarvest";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lockedProfit";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "locked0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "locked1";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken0";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken0ToNative";
    readonly outputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken0ToNativePath";
    readonly outputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken0ToNativePrice";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken1";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken1ToNative";
    readonly outputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken1ToNativePath";
    readonly outputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lpToken1ToNativePrice";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "maxTickDeviation";
    readonly outputs: readonly [{
        readonly internalType: "int56";
        readonly name: "";
        readonly type: "int56";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "native";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_minAmount0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_minAmount1";
        readonly type: "uint256";
    }];
    readonly name: "panic";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "paused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "pool";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "positionAlt";
    readonly outputs: readonly [{
        readonly internalType: "int24";
        readonly name: "tickLower";
        readonly type: "int24";
    }, {
        readonly internalType: "int24";
        readonly name: "tickUpper";
        readonly type: "int24";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "positionMain";
    readonly outputs: readonly [{
        readonly internalType: "int24";
        readonly name: "tickLower";
        readonly type: "int24";
    }, {
        readonly internalType: "int24";
        readonly name: "tickUpper";
        readonly type: "int24";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "positionWidth";
    readonly outputs: readonly [{
        readonly internalType: "int24";
        readonly name: "";
        readonly type: "int24";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "price";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_price";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "quoter";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "range";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "lowerPrice";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "upperPrice";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "rebalance";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "retireVault";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "int56";
        readonly name: "_maxDeviation";
        readonly type: "int56";
    }];
    readonly name: "setDeviation";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "_path";
        readonly type: "bytes";
    }];
    readonly name: "setLpToken0ToNativePath";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "_path";
        readonly type: "bytes";
    }];
    readonly name: "setLpToken1ToNativePath";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "int24";
        readonly name: "_width";
        readonly type: "int24";
    }];
    readonly name: "setPositionWidth";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_feeId";
        readonly type: "uint256";
    }];
    readonly name: "setStratFeeId";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_strategist";
        readonly type: "address";
    }];
    readonly name: "setStrategist";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "_interval";
        readonly type: "uint32";
    }];
    readonly name: "setTwapInterval";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_unirouter";
        readonly type: "address";
    }];
    readonly name: "setUnirouter";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "sqrtPrice";
    readonly outputs: readonly [{
        readonly internalType: "uint160";
        readonly name: "sqrtPriceX96";
        readonly type: "uint160";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "strategist";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "totalLocked0";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "totalLocked1";
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
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "twap";
    readonly outputs: readonly [{
        readonly internalType: "int56";
        readonly name: "twapTick";
        readonly type: "int56";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "twapInterval";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "unirouter";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amount0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount1";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly name: "uniswapV3MintCallback";
    readonly outputs: readonly [];
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
    readonly name: "vault";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_amount0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_amount1";
        readonly type: "uint256";
    }];
    readonly name: "withdraw";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "withdrawFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
