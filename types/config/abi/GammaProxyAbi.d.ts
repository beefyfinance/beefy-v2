export declare const GammaProxyAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_clearance";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "clearance";
    readonly outputs: readonly [{
        readonly internalType: "contract IClearing";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "deposit0";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deposit1";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "pos";
        readonly type: "address";
    }, {
        readonly internalType: "uint256[4]";
        readonly name: "minIn";
        readonly type: "uint256[4]";
    }];
    readonly name: "deposit";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "shares";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "pos";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_deposit";
        readonly type: "uint256";
    }];
    readonly name: "getDepositAmount";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amountStart";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "amountEnd";
        readonly type: "uint256";
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
        readonly internalType: "address";
        readonly name: "newClearance";
        readonly type: "address";
    }];
    readonly name: "transferClearance";
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
}];
