export declare const BeefyV2AppMulticallAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "address[][]";
        readonly name: "spenders";
        readonly type: "address[][]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "getAllowances";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "allowances";
            readonly type: "uint256[]";
        }];
        readonly internalType: "struct AllowanceInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "address[][]";
        readonly name: "spenders";
        readonly type: "address[][]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "getAllowancesFlat";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "boosts";
        readonly type: "address[]";
    }];
    readonly name: "getBoostInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "totalSupply";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardRate";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "periodFinish";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "isPreStake";
            readonly type: "bool";
        }];
        readonly internalType: "struct BoostInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "boosts";
        readonly type: "address[]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "getBoostOrGovBalance";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewards";
            readonly type: "uint256";
        }];
        readonly internalType: "struct BoostBalanceInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "vaults";
        readonly type: "address[]";
    }];
    readonly name: "getCowVaultInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "token0Balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "token1Balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "paused";
            readonly type: "bool";
        }];
        readonly internalType: "struct CowVaultInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "govVaults";
        readonly type: "address[]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "getGovVaultBalance";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewards";
            readonly type: "uint256";
        }];
        readonly internalType: "struct GovVaultBalanceInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "govVaults";
        readonly type: "address[]";
    }];
    readonly name: "getGovVaultInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "totalSupply";
            readonly type: "uint256";
        }];
        readonly internalType: "struct GovVaultInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "vaults";
        readonly type: "address[]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "getGovVaultMultiBalance";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "address[]";
            readonly name: "rewardTokens";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "rewards";
            readonly type: "uint256[]";
        }];
        readonly internalType: "struct BoostBalanceInfoV2[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "govVaults";
        readonly type: "address[]";
    }];
    readonly name: "getGovVaultMultiInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "totalSupply";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "rewardAddress";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "rate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "periodFinish";
                readonly type: "uint256";
            }];
            readonly internalType: "struct RewardInfo[]";
            readonly name: "rewards";
            readonly type: "tuple[]";
        }];
        readonly internalType: "struct GovVaultMultiInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "getTokenBalances";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "vaults";
        readonly type: "address[]";
    }];
    readonly name: "getVaultInfo";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "pricePerFullShare";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "paused";
            readonly type: "bool";
        }];
        readonly internalType: "struct VaultInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly type: "function";
    readonly name: "getERC4626VaultInfo";
    readonly inputs: readonly [{
        readonly name: "vaults";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple[]";
        readonly internalType: "struct ERC4626VaultInfo[]";
        readonly components: readonly [{
            readonly name: "balance";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "pricePerFullShare";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "paused";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
    }];
    readonly stateMutability: "view";
}];
