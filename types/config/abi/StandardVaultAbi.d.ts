export declare const StandardVaultAbi: readonly [{
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
        readonly name: "_token";
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
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Transfer";
    readonly type: "event";
}, {
    readonly payable: true;
    readonly stateMutability: "payable";
    readonly type: "fallback";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "allowance";
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
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "available";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "balance";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "controller";
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
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "subtractedValue";
        readonly type: "uint256";
    }];
    readonly name: "decreaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_amount";
        readonly type: "uint256";
    }];
    readonly name: "deposit";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "depositAll";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "depositBNB";
    readonly outputs: readonly [];
    readonly payable: true;
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "earn";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "earnLowerlimit";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "getPricePerFullShare";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "governance";
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
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "addedValue";
        readonly type: "uint256";
    }];
    readonly name: "increaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "max";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "min";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_controller";
        readonly type: "address";
    }];
    readonly name: "setController";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_earnLowerlimit";
        readonly type: "uint256";
    }];
    readonly name: "setEarnLowerlimit";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_governance";
        readonly type: "address";
    }];
    readonly name: "setGovernance";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_min";
        readonly type: "uint256";
    }];
    readonly name: "setMin";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "symbol";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "token";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "totalSupply";
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
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transfer";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_shares";
        readonly type: "uint256";
    }];
    readonly name: "withdraw";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "withdrawAll";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "withdrawAllBNB";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_shares";
        readonly type: "uint256";
    }];
    readonly name: "withdrawBNB";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "strategy";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardRate";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}];
