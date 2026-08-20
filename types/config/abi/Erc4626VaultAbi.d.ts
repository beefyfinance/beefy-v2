export declare const Erc4626VaultAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "DOMAIN_SEPARATOR";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "UPGRADE_INTERFACE_VERSION";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "addValidator";
    readonly inputs: readonly [{
        readonly name: "_validatorId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "approve";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "asset";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "balanceOf";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "beefyFeeConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "checkForSlashedValidatorsAndUndelegate";
    readonly inputs: readonly [{
        readonly name: "validatorIndex";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "claimableRedeemRequest";
    readonly inputs: readonly [{
        readonly name: "_requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "completeSlashedValidatorWithdraw";
    readonly inputs: readonly [{
        readonly name: "validatorIndex";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "amountRecovered";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "convertToAssets";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "convertToShares";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "decimals";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "_decimals";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "deposit";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "eip712Domain";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "fields";
        readonly type: "bytes1";
        readonly internalType: "bytes1";
    }, {
        readonly name: "name";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "version";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "chainId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "verifyingContract";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "salt";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "extensions";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "emergencyWithdraw";
    readonly inputs: readonly [{
        readonly name: "_requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "feeRecipients";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "beefyFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "liquidityFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getPricePerFullShare";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getRate";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "harvest";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_want";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_stakingContract";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_beefyFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_keeper";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_beefyFeeConfig";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_liquidityFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_liquidityFee";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_name";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "_symbol";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "isOperator";
    readonly inputs: readonly [{
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_operator";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "keeper";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lastHarvest";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "liquidityFee";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lockDuration";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lockedProfit";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "locked";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxDeposit";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxMint";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxRedeem";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxWithdraw";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "mint";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "name";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "nonces";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "paused";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingRedeemRequest";
    readonly inputs: readonly [{
        readonly name: "_requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "permit";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "v";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "r";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "s";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "previewDeposit";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "previewMint";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "previewRedeem";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "previewWithdraw";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "proxiableUUID";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "redeem";
    readonly inputs: readonly [{
        readonly name: "_requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "renounceOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "requestRedeem";
    readonly inputs: readonly [{
        readonly name: "_shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "requestRedeem";
    readonly inputs: readonly [{
        readonly name: "_shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_emergency";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [{
        readonly name: "requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setBeefyFeeConfig";
    readonly inputs: readonly [{
        readonly name: "_beefyFeeConfig";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setBeefyFeeRecipient";
    readonly inputs: readonly [{
        readonly name: "_beefyFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setKeeper";
    readonly inputs: readonly [{
        readonly name: "_keeper";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setLiquidityFee";
    readonly inputs: readonly [{
        readonly name: "_liquidityFee";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setLiquidityFeeRecipient";
    readonly inputs: readonly [{
        readonly name: "_liquidityFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setLockDuration";
    readonly inputs: readonly [{
        readonly name: "_lockDuration";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setMinHarvest";
    readonly inputs: readonly [{
        readonly name: "_minHarvest";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setOperator";
    readonly inputs: readonly [{
        readonly name: "_operator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_approved";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setValidatorStatus";
    readonly inputs: readonly [{
        readonly name: "_validatorIndex";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_active";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_shouldClaim";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "share";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "shareTokenAddress";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "supportsInterface";
    readonly inputs: readonly [{
        readonly name: "interfaceId";
        readonly type: "bytes4";
        readonly internalType: "bytes4";
    }];
    readonly outputs: readonly [{
        readonly name: "supported";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "symbol";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalAssets";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "total";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalLocked";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalSupply";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "transfer";
    readonly inputs: readonly [{
        readonly name: "to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "transferFrom";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "transferOwnership";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "unpause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "upgradeToAndCall";
    readonly inputs: readonly [{
        readonly name: "newImplementation";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "userPendingRedeemRequests";
    readonly inputs: readonly [{
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "requests";
        readonly type: "tuple[]";
        readonly internalType: "struct IBeefySonic.RedemptionRequest[]";
        readonly components: readonly [{
            readonly name: "assets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "shares";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "requestTimestamp";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "emergency";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "withdrawalIds";
            readonly type: "uint256[]";
            readonly internalType: "uint256[]";
        }, {
            readonly name: "validatorIds";
            readonly type: "uint256[]";
            readonly internalType: "uint256[]";
        }, {
            readonly name: "requestId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "validatorByIndex";
    readonly inputs: readonly [{
        readonly name: "_validatorIndex";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct IBeefySonic.Validator";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "delegations";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "slashedWId";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "slashedDelegations";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "active";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "claim";
            readonly type: "bool";
            readonly internalType: "bool";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "validatorsLength";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "want";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "withdraw";
    readonly inputs: readonly [{
        readonly name: "_requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_controller";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdrawDuration";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "Approval";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BeefyFeeConfigSet";
    readonly inputs: readonly [{
        readonly name: "oldBeefyFeeConfig";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newBeefyFeeConfig";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BeefyFeeRecipientSet";
    readonly inputs: readonly [{
        readonly name: "oldBeefyFeeRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newBeefyFeeRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ChargedFees";
    readonly inputs: readonly [{
        readonly name: "beefyFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "liquidityFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ClaimedRewards";
    readonly inputs: readonly [{
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Deposit";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "EIP712DomainChanged";
    readonly inputs: readonly [];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [{
        readonly name: "version";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "KeeperSet";
    readonly inputs: readonly [{
        readonly name: "oldKeeper";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newKeeper";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "LiquidityFeeRecipientSet";
    readonly inputs: readonly [{
        readonly name: "oldLiquidityFeeRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newLiquidityFeeRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "LiquidityFeeSet";
    readonly inputs: readonly [{
        readonly name: "oldLiquidityFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newLiquidityFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "LockDurationSet";
    readonly inputs: readonly [{
        readonly name: "oldLockDuration";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newLockDuration";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MinHarvestSet";
    readonly inputs: readonly [{
        readonly name: "oldMinHarvest";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "newMinHarvest";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Notify";
    readonly inputs: readonly [{
        readonly name: "notifier";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OperatorSet";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "operator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "approved";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferred";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Paused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "RedeemRequest";
    readonly inputs: readonly [{
        readonly name: "controller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "requestId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "requestTimestamp";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SlashedValidatorWithdrawn";
    readonly inputs: readonly [{
        readonly name: "validatorId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "amountRecovered";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "loss";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Unpaused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Upgraded";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ValidatorAdded";
    readonly inputs: readonly [{
        readonly name: "validatorId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "validatorIndex";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ValidatorClaimSet";
    readonly inputs: readonly [{
        readonly name: "validatorIndex";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "claim";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ValidatorSlashed";
    readonly inputs: readonly [{
        readonly name: "validatorId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "recoverableAmount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "delegations";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ValidatorStatusChanged";
    readonly inputs: readonly [{
        readonly name: "validatorIndex";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "active";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "shouldClaim";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Withdraw";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "WithdrawProcessed";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "AddressEmptyCode";
    readonly inputs: readonly [{
        readonly name: "target";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ECDSAInvalidSignature";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ECDSAInvalidSignatureLength";
    readonly inputs: readonly [{
        readonly name: "length";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ECDSAInvalidSignatureS";
    readonly inputs: readonly [{
        readonly name: "s";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC1967InvalidImplementation";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC1967NonPayable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ERC20InsufficientAllowance";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "allowance";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "needed";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InsufficientBalance";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "balance";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "needed";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidApprover";
    readonly inputs: readonly [{
        readonly name: "approver";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidReceiver";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidSender";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidSpender";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC2612ExpiredSignature";
    readonly inputs: readonly [{
        readonly name: "deadline";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC2612InvalidSigner";
    readonly inputs: readonly [{
        readonly name: "signer";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxDeposit";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxMint";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxRedeem";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxWithdraw";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC7540AsyncFlow";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "EnforcedPause";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ExpectedPause";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "FailedCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidAccountNonce";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "currentNonce";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "InvalidInitialization";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidLiquidityFee";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidValidatorIndex";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoValidators";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoValidatorsWithCapacity";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotAuthorized";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotClaimableYet";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotEnoughRewards";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotInitializing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotOK";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotReadyForHarvest";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NothingToWithdraw";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OwnableInvalidOwner";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "OwnableUnauthorizedAccount";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "SafeERC20FailedOperation";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "SlashNotRealized";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UUPSUnauthorizedCallContext";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UUPSUnsupportedProxiableUUID";
    readonly inputs: readonly [{
        readonly name: "slot";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
}, {
    readonly type: "error";
    readonly name: "ValidatorNotFound";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "WithdrawError";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroAddress";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroDeposit";
    readonly inputs: readonly [];
}];
