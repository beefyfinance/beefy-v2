export declare const BeefyZapRouterAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_permit2";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "callData";
        readonly type: "bytes";
    }];
    readonly name: "CallFailed";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }];
    readonly name: "CallerNotZap";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }];
    readonly name: "EtherTransferFailed";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "balance";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "relayValue";
        readonly type: "uint256";
    }];
    readonly name: "InsufficientRelayValue";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }];
    readonly name: "InvalidCaller";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "minAmountOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "balance";
        readonly type: "uint256";
    }];
    readonly name: "Slippage";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }];
    readonly name: "TargetingInvalidContract";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBeefyZapRouter.Input[]";
            readonly name: "inputs";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "minOutputAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBeefyZapRouter.Output[]";
            readonly name: "outputs";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "target";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "value";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IBeefyZapRouter.Relay";
            readonly name: "relay";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly indexed: true;
        readonly internalType: "struct IBeefyZapRouter.Order";
        readonly name: "order";
        readonly type: "tuple";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }];
    readonly name: "FulfilledOrder";
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
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "RelayData";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
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
    readonly name: "TokenReturned";
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
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IPermit2.TokenPermissions[]";
            readonly name: "permitted";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IPermit2.PermitBatchTransferFrom";
        readonly name: "_permit";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBeefyZapRouter.Input[]";
            readonly name: "inputs";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "minOutputAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBeefyZapRouter.Output[]";
            readonly name: "outputs";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "target";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "value";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IBeefyZapRouter.Relay";
            readonly name: "relay";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly internalType: "struct IBeefyZapRouter.Order";
        readonly name: "_order";
        readonly type: "tuple";
    }, {
        readonly internalType: "bytes";
        readonly name: "_signature";
        readonly type: "bytes";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "int32";
                readonly name: "index";
                readonly type: "int32";
            }];
            readonly internalType: "struct IBeefyZapRouter.StepToken[]";
            readonly name: "tokens";
            readonly type: "tuple[]";
        }];
        readonly internalType: "struct IBeefyZapRouter.Step[]";
        readonly name: "_route";
        readonly type: "tuple[]";
    }];
    readonly name: "executeOrder";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBeefyZapRouter.Input[]";
            readonly name: "inputs";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "minOutputAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBeefyZapRouter.Output[]";
            readonly name: "outputs";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "target";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "value";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IBeefyZapRouter.Relay";
            readonly name: "relay";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly internalType: "struct IBeefyZapRouter.Order";
        readonly name: "_order";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "int32";
                readonly name: "index";
                readonly type: "int32";
            }];
            readonly internalType: "struct IBeefyZapRouter.StepToken[]";
            readonly name: "tokens";
            readonly type: "tuple[]";
        }];
        readonly internalType: "struct IBeefyZapRouter.Step[]";
        readonly name: "_route";
        readonly type: "tuple[]";
    }];
    readonly name: "executeOrder";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
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
    readonly inputs: readonly [];
    readonly name: "pause";
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
    readonly name: "permit2";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
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
    readonly name: "unpause";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
