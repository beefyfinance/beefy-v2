export declare const UniswapV2FactoryAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_feeToSetter";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token0";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token1";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "pair";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "PairCreated";
    readonly type: "event";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "INIT_CODE_PAIR_HASH";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "allPairs";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "allPairsLength";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "tokenA";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "tokenB";
        readonly type: "address";
    }];
    readonly name: "createPair";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "pair";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "feeTo";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "feeToSetter";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "getPair";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_feeTo";
        readonly type: "address";
    }];
    readonly name: "setFeeTo";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_feeToSetter";
        readonly type: "address";
    }];
    readonly name: "setFeeToSetter";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
