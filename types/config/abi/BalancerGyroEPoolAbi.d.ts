export declare const BalancerGyroEPoolAbi: readonly [{
    readonly inputs: readonly [{
        readonly components: readonly [{
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
                readonly internalType: "contract IERC20";
                readonly name: "token0";
                readonly type: "address";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "token1";
                readonly type: "address";
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
                readonly internalType: "address";
                readonly name: "owner";
                readonly type: "address";
            }];
            readonly internalType: "struct ExtensibleWeightedPool2Tokens.NewPoolParams";
            readonly name: "baseParams";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "int256";
                readonly name: "alpha";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "beta";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "c";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "s";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "lambda";
                readonly type: "int256";
            }];
            readonly internalType: "struct GyroECLPMath.Params";
            readonly name: "eclpParams";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "int256";
                    readonly name: "x";
                    readonly type: "int256";
                }, {
                    readonly internalType: "int256";
                    readonly name: "y";
                    readonly type: "int256";
                }];
                readonly internalType: "struct GyroECLPMath.Vector2";
                readonly name: "tauAlpha";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "int256";
                    readonly name: "x";
                    readonly type: "int256";
                }, {
                    readonly internalType: "int256";
                    readonly name: "y";
                    readonly type: "int256";
                }];
                readonly internalType: "struct GyroECLPMath.Vector2";
                readonly name: "tauBeta";
                readonly type: "tuple";
            }, {
                readonly internalType: "int256";
                readonly name: "u";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "v";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "w";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "z";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "dSq";
                readonly type: "int256";
            }];
            readonly internalType: "struct GyroECLPMath.DerivedParams";
            readonly name: "derivedEclpParams";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "rateProvider0";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "rateProvider1";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "capManager";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "bool";
                readonly name: "capEnabled";
                readonly type: "bool";
            }, {
                readonly internalType: "uint120";
                readonly name: "perAddressCap";
                readonly type: "uint120";
            }, {
                readonly internalType: "uint128";
                readonly name: "globalCap";
                readonly type: "uint128";
            }];
            readonly internalType: "struct ICappedLiquidity.CapParams";
            readonly name: "capParams";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "pauseManager";
            readonly type: "address";
        }];
        readonly internalType: "struct GyroECLPPool.GyroParams";
        readonly name: "params";
        readonly type: "tuple";
    }, {
        readonly internalType: "address";
        readonly name: "configAddress";
        readonly type: "address";
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
        readonly internalType: "address";
        readonly name: "capManager";
        readonly type: "address";
    }];
    readonly name: "CapManagerUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "bool";
            readonly name: "capEnabled";
            readonly type: "bool";
        }, {
            readonly internalType: "uint120";
            readonly name: "perAddressCap";
            readonly type: "uint120";
        }, {
            readonly internalType: "uint128";
            readonly name: "globalCap";
            readonly type: "uint128";
        }];
        readonly indexed: false;
        readonly internalType: "struct ICappedLiquidity.CapParams";
        readonly name: "params";
        readonly type: "tuple";
    }];
    readonly name: "CapParamsUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "derivedParamsValidated";
        readonly type: "bool";
    }];
    readonly name: "ECLPDerivedParamsValidated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "paramsValidated";
        readonly type: "bool";
    }];
    readonly name: "ECLPParamsValidated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "invariantAfterJoin";
        readonly type: "uint256";
    }];
    readonly name: "InvariantAterInitializeJoin";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "oldInvariant";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "newInvariant";
        readonly type: "uint256";
    }];
    readonly name: "InvariantOldAndNew";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "oldPauseManager";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newPauseManager";
        readonly type: "address";
    }];
    readonly name: "PauseManagerChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "PausedLocally";
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
        readonly indexed: false;
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly components: readonly [{
            readonly internalType: "int256";
            readonly name: "x";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "y";
            readonly type: "int256";
        }];
        readonly indexed: false;
        readonly internalType: "struct GyroECLPMath.Vector2";
        readonly name: "invariant";
        readonly type: "tuple";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "SwapParams";
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
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "UnpausedLocally";
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
    readonly name: "capManager";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "capParams";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "bool";
            readonly name: "capEnabled";
            readonly type: "bool";
        }, {
            readonly internalType: "uint120";
            readonly name: "perAddressCap";
            readonly type: "uint120";
        }, {
            readonly internalType: "uint128";
            readonly name: "globalCap";
            readonly type: "uint128";
        }];
        readonly internalType: "struct ICappedLiquidity.CapParams";
        readonly name: "";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_pauseManager";
        readonly type: "address";
    }];
    readonly name: "changePauseManager";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
    readonly name: "getECLPParams";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "int256";
            readonly name: "alpha";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "beta";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "c";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "s";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "lambda";
            readonly type: "int256";
        }];
        readonly internalType: "struct GyroECLPMath.Params";
        readonly name: "params";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "int256";
                readonly name: "x";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "y";
                readonly type: "int256";
            }];
            readonly internalType: "struct GyroECLPMath.Vector2";
            readonly name: "tauAlpha";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "int256";
                readonly name: "x";
                readonly type: "int256";
            }, {
                readonly internalType: "int256";
                readonly name: "y";
                readonly type: "int256";
            }];
            readonly internalType: "struct GyroECLPMath.Vector2";
            readonly name: "tauBeta";
            readonly type: "tuple";
        }, {
            readonly internalType: "int256";
            readonly name: "u";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "v";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "w";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "z";
            readonly type: "int256";
        }, {
            readonly internalType: "int256";
            readonly name: "dSq";
            readonly type: "int256";
        }];
        readonly internalType: "struct GyroECLPMath.DerivedParams";
        readonly name: "d";
        readonly type: "tuple";
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
    readonly name: "getInvariantDivActualSupply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getLastInvariant";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getMiscData";
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
    }, {
        readonly internalType: "uint256";
        readonly name: "swapFeePercentage";
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
    readonly inputs: readonly [];
    readonly name: "getPrice";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "spotPrice";
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
    readonly name: "getTokenRates";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "rate0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "rate1";
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
    readonly name: "gyroConfig";
    readonly outputs: readonly [{
        readonly internalType: "contract IGyroConfig";
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
    readonly inputs: readonly [];
    readonly name: "pauseManager";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
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
    readonly inputs: readonly [];
    readonly name: "rateProvider0";
    readonly outputs: readonly [{
        readonly internalType: "contract IRateProvider";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "rateProvider1";
    readonly outputs: readonly [{
        readonly internalType: "contract IRateProvider";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_capManager";
        readonly type: "address";
    }];
    readonly name: "setCapManager";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "bool";
            readonly name: "capEnabled";
            readonly type: "bool";
        }, {
            readonly internalType: "uint120";
            readonly name: "perAddressCap";
            readonly type: "uint120";
        }, {
            readonly internalType: "uint128";
            readonly name: "globalCap";
            readonly type: "uint128";
        }];
        readonly internalType: "struct ICappedLiquidity.CapParams";
        readonly name: "params";
        readonly type: "tuple";
    }];
    readonly name: "setCapParams";
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
}];
