export declare const BeefyCommonBridgeAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "_bifi";
        readonly type: "address";
    }, {
        readonly internalType: "contract IXERC20";
        readonly name: "_xbifi";
        readonly type: "address";
    }, {
        readonly internalType: "contract IXERC20Lockbox";
        readonly name: "_lockbox";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_gasLimit";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "_endpoint";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint16";
        readonly name: "srcChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "tokenReceiver";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "BridgedIn";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "uint16";
        readonly name: "dstChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "bridgeUser";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "tokenReceiver";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "BridgedOut";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }, {
        readonly indexed: false;
        readonly internalType: "uint64";
        readonly name: "_nonce";
        readonly type: "uint64";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "_payload";
        readonly type: "bytes";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "_reason";
        readonly type: "bytes";
    }];
    readonly name: "MessageFailed";
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
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }, {
        readonly indexed: false;
        readonly internalType: "uint64";
        readonly name: "_nonce";
        readonly type: "uint64";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes32";
        readonly name: "_payloadHash";
        readonly type: "bytes32";
    }];
    readonly name: "RetryMessageSuccess";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint16";
        readonly name: "_dstChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: false;
        readonly internalType: "uint16";
        readonly name: "_type";
        readonly type: "uint16";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "_minDstGas";
        readonly type: "uint256";
    }];
    readonly name: "SetMinDstGas";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "precrime";
        readonly type: "address";
    }];
    readonly name: "SetPrecrime";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint16";
        readonly name: "_remoteChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "_path";
        readonly type: "bytes";
    }];
    readonly name: "SetTrustedRemote";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint16";
        readonly name: "_remoteChainId";
        readonly type: "uint16";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "_remoteAddress";
        readonly type: "bytes";
    }];
    readonly name: "SetTrustedRemoteAddress";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "BIFI";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "DEFAULT_PAYLOAD_SIZE_LIMIT";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_dstChainId";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "_to";
        readonly type: "address";
    }];
    readonly name: "bridge";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_dstChainId";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "_to";
        readonly type: "address";
    }];
    readonly name: "bridgeCost";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "gasCost";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }, {
        readonly internalType: "uint64";
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly name: "failedMessages";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }];
    readonly name: "forceResumeReceive";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "gasLimit";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_version";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint16";
        readonly name: "_chainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_configType";
        readonly type: "uint256";
    }];
    readonly name: "getConfig";
    readonly outputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_remoteChainId";
        readonly type: "uint16";
    }];
    readonly name: "getTrustedRemoteAddress";
    readonly outputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }];
    readonly name: "isTrustedRemote";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lockbox";
    readonly outputs: readonly [{
        readonly internalType: "contract IXERC20Lockbox";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "lzEndpoint";
    readonly outputs: readonly [{
        readonly internalType: "contract ILayerZeroEndpoint";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }, {
        readonly internalType: "uint64";
        readonly name: "_nonce";
        readonly type: "uint64";
    }, {
        readonly internalType: "bytes";
        readonly name: "_payload";
        readonly type: "bytes";
    }];
    readonly name: "lzReceive";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint16";
        readonly name: "";
        readonly type: "uint16";
    }];
    readonly name: "minDstGasLookup";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }, {
        readonly internalType: "uint64";
        readonly name: "_nonce";
        readonly type: "uint64";
    }, {
        readonly internalType: "bytes";
        readonly name: "_payload";
        readonly type: "bytes";
    }];
    readonly name: "nonblockingLzReceive";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
        readonly internalType: "uint16";
        readonly name: "";
        readonly type: "uint16";
    }];
    readonly name: "payloadSizeLimitLookup";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "precrime";
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
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_srcChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_srcAddress";
        readonly type: "bytes";
    }, {
        readonly internalType: "uint64";
        readonly name: "_nonce";
        readonly type: "uint64";
    }, {
        readonly internalType: "bytes";
        readonly name: "_payload";
        readonly type: "bytes";
    }];
    readonly name: "retryMessage";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_version";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint16";
        readonly name: "_chainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint256";
        readonly name: "_configType";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "_config";
        readonly type: "bytes";
    }];
    readonly name: "setConfig";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_gasLimit";
        readonly type: "uint256";
    }];
    readonly name: "setGasLimit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_dstChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint16";
        readonly name: "_packetType";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint256";
        readonly name: "_minGas";
        readonly type: "uint256";
    }];
    readonly name: "setMinDstGas";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_dstChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "uint256";
        readonly name: "_size";
        readonly type: "uint256";
    }];
    readonly name: "setPayloadSizeLimit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_precrime";
        readonly type: "address";
    }];
    readonly name: "setPrecrime";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_version";
        readonly type: "uint16";
    }];
    readonly name: "setReceiveVersion";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_version";
        readonly type: "uint16";
    }];
    readonly name: "setSendVersion";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_remoteChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_path";
        readonly type: "bytes";
    }];
    readonly name: "setTrustedRemote";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "_remoteChainId";
        readonly type: "uint16";
    }, {
        readonly internalType: "bytes";
        readonly name: "_remoteAddress";
        readonly type: "bytes";
    }];
    readonly name: "setTrustedRemoteAddress";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
    readonly inputs: readonly [{
        readonly internalType: "uint16";
        readonly name: "";
        readonly type: "uint16";
    }];
    readonly name: "trustedRemoteLookup";
    readonly outputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "xBIFI";
    readonly outputs: readonly [{
        readonly internalType: "contract IXERC20";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
