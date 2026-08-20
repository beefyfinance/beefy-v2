export declare const BalancerVaultAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract IAuthorizer";
        readonly name: "authorizer";
        readonly type: "address";
    }, {
        readonly internalType: "contract IWETH";
        readonly name: "weth";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "pauseWindowDuration";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "bufferPeriodDuration";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract IAuthorizer";
        readonly name: "newAuthorizer";
        readonly type: "address";
    }];
    readonly name: "AuthorizerChanged";
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
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "ExternalBalanceTransfer";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "contract IFlashLoanRecipient";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "feeAmount";
        readonly type: "uint256";
    }];
    readonly name: "FlashLoan";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "int256";
        readonly name: "delta";
        readonly type: "int256";
    }];
    readonly name: "InternalBalanceChanged";
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
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "liquidityProvider";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly indexed: false;
        readonly internalType: "int256[]";
        readonly name: "deltas";
        readonly type: "int256[]";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256[]";
        readonly name: "protocolFeeAmounts";
        readonly type: "uint256[]";
    }];
    readonly name: "PoolBalanceChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "assetManager";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "int256";
        readonly name: "cashDelta";
        readonly type: "int256";
    }, {
        readonly indexed: false;
        readonly internalType: "int256";
        readonly name: "managedDelta";
        readonly type: "int256";
    }];
    readonly name: "PoolBalanceManaged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "poolAddress";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "enum IVault.PoolSpecialization";
        readonly name: "specialization";
        readonly type: "uint8";
    }];
    readonly name: "PoolRegistered";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "relayer";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "approved";
        readonly type: "bool";
    }];
    readonly name: "RelayerApprovalChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "contract IERC20";
        readonly name: "tokenIn";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "contract IERC20";
        readonly name: "tokenOut";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amountIn";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amountOut";
        readonly type: "uint256";
    }];
    readonly name: "Swap";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }];
    readonly name: "TokensDeregistered";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly indexed: false;
        readonly internalType: "address[]";
        readonly name: "assetManagers";
        readonly type: "address[]";
    }];
    readonly name: "TokensRegistered";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "WETH";
    readonly outputs: readonly [{
        readonly internalType: "contract IWETH";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
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
    }, {
        readonly internalType: "int256[]";
        readonly name: "limits";
        readonly type: "int256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }];
    readonly name: "batchSwap";
    readonly outputs: readonly [{
        readonly internalType: "int256[]";
        readonly name: "assetDeltas";
        readonly type: "int256[]";
    }];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }];
    readonly name: "deregisterTokens";
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
        readonly internalType: "address payable";
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
    readonly name: "exitPool";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IFlashLoanRecipient";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "amounts";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "bytes";
        readonly name: "userData";
        readonly type: "bytes";
    }];
    readonly name: "flashLoan";
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
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }];
    readonly name: "getInternalBalance";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "user";
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
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }];
    readonly name: "getPool";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "enum IVault.PoolSpecialization";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "getPoolTokenInfo";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "cash";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "managed";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastChangeBlock";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "assetManager";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }];
    readonly name: "getPoolTokens";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "balances";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "lastChangeBlock";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getProtocolFeesCollector";
    readonly outputs: readonly [{
        readonly internalType: "contract ProtocolFeesCollector";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "relayer";
        readonly type: "address";
    }];
    readonly name: "hasApprovedRelayer";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
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
    readonly name: "joinPool";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "enum IVault.PoolBalanceOpKind";
            readonly name: "kind";
            readonly type: "uint8";
        }, {
            readonly internalType: "bytes32";
            readonly name: "poolId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IVault.PoolBalanceOp[]";
        readonly name: "ops";
        readonly type: "tuple[]";
    }];
    readonly name: "managePoolBalance";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "enum IVault.UserBalanceOpKind";
            readonly name: "kind";
            readonly type: "uint8";
        }, {
            readonly internalType: "contract IAsset";
            readonly name: "asset";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address payable";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly internalType: "struct IVault.UserBalanceOp[]";
        readonly name: "ops";
        readonly type: "tuple[]";
    }];
    readonly name: "manageUserBalance";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
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
        readonly name: "";
        readonly type: "int256[]";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "enum IVault.PoolSpecialization";
        readonly name: "specialization";
        readonly type: "uint8";
    }];
    readonly name: "registerPool";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "poolId";
        readonly type: "bytes32";
    }, {
        readonly internalType: "contract IERC20[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "address[]";
        readonly name: "assetManagers";
        readonly type: "address[]";
    }];
    readonly name: "registerTokens";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IAuthorizer";
        readonly name: "newAuthorizer";
        readonly type: "address";
    }];
    readonly name: "setAuthorizer";
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
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "relayer";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "approved";
        readonly type: "bool";
    }];
    readonly name: "setRelayerApproval";
    readonly outputs: readonly [];
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
    }, {
        readonly internalType: "uint256";
        readonly name: "limit";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }];
    readonly name: "swap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amountCalculated";
        readonly type: "uint256";
    }];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
