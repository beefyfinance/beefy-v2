export declare const stellaswapRewarderAbi: readonly [{
    readonly inputs: readonly [];
    readonly name: "InvalidLengths";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "isNative";
        readonly type: "bool";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "startTimestamp";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "endTimestamp";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "rewardPerSec";
        readonly type: "uint256";
    }];
    readonly name: "AddRewardInfo";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "positionId";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Claimed";
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
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Recovered";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bytes32";
        readonly name: "merkleRoot";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "ipfsHash";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "rewardTime";
        readonly type: "uint256";
    }];
    readonly name: "TreeUpdated";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "EPOCH_DURATION";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "REWARD_REGISTRY";
    readonly outputs: readonly [{
        readonly internalType: "contract IRewardRegistry";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "startTimestamp";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint32";
        readonly name: "endTimestamp";
        readonly type: "uint32";
    }];
    readonly name: "_getRewardsBetweenTimestamps";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "uint32";
            readonly name: "startTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct RewarderV4.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "_isNative";
        readonly type: "bool";
    }, {
        readonly internalType: "uint32";
        readonly name: "_startTimestamp";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint32";
        readonly name: "_endTimestamp";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint256";
        readonly name: "_rewardPerSec";
        readonly type: "uint256";
    }];
    readonly name: "addRewardInfo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "position";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "proof";
            readonly type: "bytes32[]";
        }];
        readonly internalType: "struct RewarderV4.ClaimData[]";
        readonly name: "claims";
        readonly type: "tuple[]";
    }];
    readonly name: "claim";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "claimed";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint48";
        readonly name: "timestamp";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getActiveRewards";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "uint32";
            readonly name: "startTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct RewarderV4.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getMerkleRoot";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getRewardForNextEpoch";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "uint32";
            readonly name: "startTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct RewarderV4.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "epoch";
        readonly type: "uint32";
    }];
    readonly name: "getRewardForTimestamp";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "uint32";
            readonly name: "startTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct RewarderV4.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "startTimestamp";
        readonly type: "uint32";
    }];
    readonly name: "getRewardsAfterEpoch";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "uint32";
            readonly name: "startTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct RewarderV4.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "startTimestamp";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint32";
        readonly name: "endTimestamp";
        readonly type: "uint32";
    }];
    readonly name: "getRewardsBetweenEpochs";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isNative";
            readonly type: "bool";
        }, {
            readonly internalType: "uint32";
            readonly name: "startTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endTimestamp";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "rewardPerSec";
            readonly type: "uint256";
        }];
        readonly internalType: "struct RewarderV4.RewardInfo[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "timestamp";
        readonly type: "uint32";
    }];
    readonly name: "getRoundedTimestamp";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IRewardRegistry";
        readonly name: "_registry";
        readonly type: "address";
    }];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lastRewardTimestamp";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lastRewardUpdateTime";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lastTree";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "merkleRoot";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "ipfsHash";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lastTreeUpdate";
    readonly outputs: readonly [{
        readonly internalType: "uint48";
        readonly name: "";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_token";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "bool";
        readonly name: "isNative";
        readonly type: "bool";
    }];
    readonly name: "recover";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "reportPeriodElapsed";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "rewardInfo";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "isNative";
        readonly type: "bool";
    }, {
        readonly internalType: "uint32";
        readonly name: "startTimestamp";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint32";
        readonly name: "endTimestamp";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint256";
        readonly name: "rewardPerSec";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "rewardInfoLength";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "rewardStartTime";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "_newLastReportedTimestamp";
        readonly type: "uint32";
    }];
    readonly name: "setLastReportedTimestamp";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "tree";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "merkleRoot";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "ipfsHash";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "_merkleRoot";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "_ipfsHash";
        readonly type: "string";
    }];
    readonly name: "updateTree";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "version";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
