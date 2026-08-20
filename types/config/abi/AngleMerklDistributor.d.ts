export declare const AngleMerklDistributorAbi: readonly [{
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidDispute";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidLengths";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidProof";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidUninitializedRoot";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NoDispute";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotGovernor";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotGovernorOrGuardian";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotTrusted";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotWhitelisted";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "UnresolvedDispute";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "ZeroAddress";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "previousAdmin";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "newAdmin";
        readonly type: "address";
    }];
    readonly name: "AdminChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "beacon";
        readonly type: "address";
    }];
    readonly name: "BeaconUpgraded";
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
        readonly internalType: "uint256";
        readonly name: "_disputeAmount";
        readonly type: "uint256";
    }];
    readonly name: "DisputeAmountUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "_disputePeriod";
        readonly type: "uint48";
    }];
    readonly name: "DisputePeriodUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "valid";
        readonly type: "bool";
    }];
    readonly name: "DisputeResolved";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "_disputeToken";
        readonly type: "address";
    }];
    readonly name: "DisputeTokenUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "reason";
        readonly type: "string";
    }];
    readonly name: "Disputed";
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
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "isEnabled";
        readonly type: "bool";
    }];
    readonly name: "OperatorClaimingToggled";
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
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "isWhitelisted";
        readonly type: "bool";
    }];
    readonly name: "OperatorToggled";
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
    readonly inputs: readonly [];
    readonly name: "Revoked";
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
        readonly internalType: "bytes32";
        readonly name: "ipfsHash";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "endOfDisputePeriod";
        readonly type: "uint48";
    }];
    readonly name: "TreeUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "eoa";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "trust";
        readonly type: "bool";
    }];
    readonly name: "TrustedToggled";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "implementation";
        readonly type: "address";
    }];
    readonly name: "Upgraded";
    readonly type: "event";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "canUpdateMerkleRoot";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "users";
        readonly type: "address[]";
    }, {
        readonly internalType: "address[]";
        readonly name: "tokens";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "amounts";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "bytes32[][]";
        readonly name: "proofs";
        readonly type: "bytes32[][]";
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
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "claimed";
    readonly outputs: readonly [{
        readonly internalType: "uint208";
        readonly name: "amount";
        readonly type: "uint208";
    }, {
        readonly internalType: "uint48";
        readonly name: "timestamp";
        readonly type: "uint48";
    }, {
        readonly internalType: "bytes32";
        readonly name: "merkleRoot";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "core";
    readonly outputs: readonly [{
        readonly internalType: "contract ICore";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "disputeAmount";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "disputePeriod";
    readonly outputs: readonly [{
        readonly internalType: "uint48";
        readonly name: "";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "disputeToken";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "reason";
        readonly type: "string";
    }];
    readonly name: "disputeTree";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "disputer";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "endOfDisputePeriod";
    readonly outputs: readonly [{
        readonly internalType: "uint48";
        readonly name: "";
        readonly type: "uint48";
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
    readonly inputs: readonly [{
        readonly internalType: "contract ICore";
        readonly name: "_core";
        readonly type: "address";
    }];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lastTree";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "merkleRoot";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "ipfsHash";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "onlyOperatorCanClaim";
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
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "operators";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "proxiableUUID";
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
        readonly name: "tokenAddress";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amountToRecover";
        readonly type: "uint256";
    }];
    readonly name: "recoverERC20";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bool";
        readonly name: "valid";
        readonly type: "bool";
    }];
    readonly name: "resolveDispute";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "revokeTree";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_disputeAmount";
        readonly type: "uint256";
    }];
    readonly name: "setDisputeAmount";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint48";
        readonly name: "_disputePeriod";
        readonly type: "uint48";
    }];
    readonly name: "setDisputePeriod";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "_disputeToken";
        readonly type: "address";
    }];
    readonly name: "setDisputeToken";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "user";
        readonly type: "address";
    }];
    readonly name: "toggleOnlyOperatorCanClaim";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }];
    readonly name: "toggleOperator";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "eoa";
        readonly type: "address";
    }];
    readonly name: "toggleTrusted";
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
        readonly internalType: "bytes32";
        readonly name: "ipfsHash";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "bytes32";
            readonly name: "merkleRoot";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "ipfsHash";
            readonly type: "bytes32";
        }];
        readonly internalType: "struct MerkleTree";
        readonly name: "_tree";
        readonly type: "tuple";
    }];
    readonly name: "updateTree";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newImplementation";
        readonly type: "address";
    }];
    readonly name: "upgradeTo";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newImplementation";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "upgradeToAndCall";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}];
