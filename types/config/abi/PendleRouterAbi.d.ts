export declare const PendleRouterAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "market";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "minLpOut";
        readonly type: "uint256";
    }, {
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "guessMin";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "guessMax";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "guessOffchain";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxIteration";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "eps";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ApproxParams";
        readonly name: "guessPtReceivedFromSy";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "tokenIn";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "netTokenIn";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "tokenMintSy";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "pendleSwap";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "swapType";
                readonly type: "uint8";
            }, {
                readonly internalType: "address";
                readonly name: "extRouter";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "extCalldata";
                readonly type: "bytes";
            }, {
                readonly internalType: "bool";
                readonly name: "needScale";
                readonly type: "bool";
            }];
            readonly internalType: "struct SwapData";
            readonly name: "swapData";
            readonly type: "tuple";
        }];
        readonly internalType: "struct TokenInput";
        readonly name: "input";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "limitRouter";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "epsSkipMarket";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "salt";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiry";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "orderType";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "YT";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "maker";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "receiver";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "makingAmount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "lnImpliedRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "failSafeRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "permit";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct Order";
                readonly name: "order";
                readonly type: "tuple";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct FillOrderParams[]";
            readonly name: "normalFills";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "salt";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiry";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "orderType";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "YT";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "maker";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "receiver";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "makingAmount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "lnImpliedRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "failSafeRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "permit";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct Order";
                readonly name: "order";
                readonly type: "tuple";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct FillOrderParams[]";
            readonly name: "flashFills";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "bytes";
            readonly name: "optData";
            readonly type: "bytes";
        }];
        readonly internalType: "struct LimitOrderData";
        readonly name: "limit";
        readonly type: "tuple";
    }];
    readonly name: "addLiquiditySingleToken";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "netLpOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyInterm";
        readonly type: "uint256";
    }];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "market";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "netLpToRemove";
        readonly type: "uint256";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "tokenOut";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "minTokenOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "tokenRedeemSy";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "pendleSwap";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "swapType";
                readonly type: "uint8";
            }, {
                readonly internalType: "address";
                readonly name: "extRouter";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "extCalldata";
                readonly type: "bytes";
            }, {
                readonly internalType: "bool";
                readonly name: "needScale";
                readonly type: "bool";
            }];
            readonly internalType: "struct SwapData";
            readonly name: "swapData";
            readonly type: "tuple";
        }];
        readonly internalType: "struct TokenOutput";
        readonly name: "output";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "limitRouter";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "epsSkipMarket";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "salt";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiry";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "orderType";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "YT";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "maker";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "receiver";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "makingAmount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "lnImpliedRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "failSafeRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "permit";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct Order";
                readonly name: "order";
                readonly type: "tuple";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct FillOrderParams[]";
            readonly name: "normalFills";
            readonly type: "tuple[]";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "salt";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expiry";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "orderType";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "YT";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "maker";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "receiver";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "makingAmount";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "lnImpliedRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "failSafeRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "permit";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct Order";
                readonly name: "order";
                readonly type: "tuple";
            }, {
                readonly internalType: "bytes";
                readonly name: "signature";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct FillOrderParams[]";
            readonly name: "flashFills";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "bytes";
            readonly name: "optData";
            readonly type: "bytes";
        }];
        readonly internalType: "struct LimitOrderData";
        readonly name: "limit";
        readonly type: "tuple";
    }];
    readonly name: "removeLiquiditySingleToken";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "netTokenOut";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "netSyInterm";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
