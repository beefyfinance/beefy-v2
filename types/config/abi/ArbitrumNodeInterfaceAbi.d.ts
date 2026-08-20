export declare const ArbitrumNodeInterfaceAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "size";
        readonly type: "uint64";
    }, {
        readonly internalType: "uint64";
        readonly name: "leaf";
        readonly type: "uint64";
    }];
    readonly name: "constructOutboxProof";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "send";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "root";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32[]";
        readonly name: "proof";
        readonly type: "bytes32[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "deposit";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "l2CallValue";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "excessFeeRefundAddress";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "callValueRefundAddress";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "estimateRetryableTicket";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "blockNum";
        readonly type: "uint64";
    }];
    readonly name: "findBatchContainingBlock";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "batch";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "contractCreation";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "gasEstimateComponents";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "gasEstimate";
        readonly type: "uint64";
    }, {
        readonly internalType: "uint64";
        readonly name: "gasEstimateForL1";
        readonly type: "uint64";
    }, {
        readonly internalType: "uint256";
        readonly name: "baseFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "l1BaseFeeEstimate";
        readonly type: "uint256";
    }];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "contractCreation";
        readonly type: "bool";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "gasEstimateL1Component";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "gasEstimateForL1";
        readonly type: "uint64";
    }, {
        readonly internalType: "uint256";
        readonly name: "baseFee";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "l1BaseFeeEstimate";
        readonly type: "uint256";
    }];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "blockHash";
        readonly type: "bytes32";
    }];
    readonly name: "getL1Confirmations";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "confirmations";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "batchNum";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint64";
        readonly name: "index";
        readonly type: "uint64";
    }];
    readonly name: "legacyLookupMessageBatchProof";
    readonly outputs: readonly [{
        readonly internalType: "bytes32[]";
        readonly name: "proof";
        readonly type: "bytes32[]";
    }, {
        readonly internalType: "uint256";
        readonly name: "path";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "l2Sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "l1Dest";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "l2Block";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "l1Block";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "timestamp";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "calldataForL1";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "nitroGenesisBlock";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "number";
        readonly type: "uint256";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}];
