export declare const CircleBeefyZapReceiverAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_usdc";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_messageTransmitter";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_zap";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_recovery";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_fee";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidAmount";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidBurnMessage";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidCaller";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidHookData";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidMessage";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidRecipient";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "zap";
        readonly type: "address";
    }];
    readonly name: "InvalidZap";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "RelayFailure";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "nonce";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "relayer";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "FeePaid";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "oldFee";
        readonly type: "uint256";
    }, {
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "newFee";
        readonly type: "uint256";
    }];
    readonly name: "FeeUpdated";
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
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "oldRecovery";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newRecovery";
        readonly type: "address";
    }];
    readonly name: "RecoveryAddressUpdated";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "nonce";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "success";
        readonly type: "bool";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amountIn";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "refundedAmount";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "recoveredAmount";
        readonly type: "uint256";
    }];
    readonly name: "ZapExecuted";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "fee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "messageTransmitter";
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
        readonly internalType: "bytes";
        readonly name: "message";
        readonly type: "bytes";
    }];
    readonly name: "processHook";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "zapSuccess";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "recovery";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "message";
        readonly type: "bytes";
    }, {
        readonly internalType: "bytes";
        readonly name: "attestation";
        readonly type: "bytes";
    }];
    readonly name: "relay";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "zapStatus";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_fee";
        readonly type: "uint256";
    }];
    readonly name: "setFee";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_recovery";
        readonly type: "address";
    }];
    readonly name: "setRecovery";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "tokenManager";
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
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "usdc";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "zap";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
/** ZapPayload ABI params for use with encodeAbiParameters */
export declare const ZapPayloadAbiParams: readonly [{
    readonly type: "tuple";
    readonly components: readonly [{
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "outputs";
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly name: "minOutputAmount";
            readonly type: "uint256";
        }];
    }, {
        readonly name: "relay";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly name: "data";
            readonly type: "bytes";
        }];
    }, {
        readonly name: "route";
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly name: "tokens";
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly name: "index";
                readonly type: "int32";
            }];
        }];
    }];
}];
