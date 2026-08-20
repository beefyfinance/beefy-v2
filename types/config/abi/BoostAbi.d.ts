export declare const BoostAbi: readonly [{
    readonly constant: true;
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "earned";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "rewards";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "notifyRewardAmount";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "duration";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "totalSupply";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly name: "amount";
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
    readonly name: "getReward";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardRate";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "lastTimeRewardApplicable";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "userRewardPerTokenPaid";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "isOwner";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "stake";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "lastUpdateTime";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "stakedToken";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardPerToken";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly name: "_token";
        readonly type: "address";
    }];
    readonly name: "inCaseTokensGetStuck";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardPerTokenStored";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [];
    readonly name: "exit";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "periodFinish";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: false;
    readonly inputs: readonly [{
        readonly name: "_token";
        readonly type: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
    }];
    readonly name: "inCaseTokensGetStuck";
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: "rewardToken";
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly payable: false;
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly name: "_stakedToken";
        readonly type: "address";
    }, {
        readonly name: "_rewardToken";
        readonly type: "address";
    }, {
        readonly name: "_duration";
        readonly type: "uint256";
    }];
    readonly payable: false;
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly name: "reward";
        readonly type: "uint256";
    }];
    readonly name: "RewardAdded";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Staked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "Withdrawn";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "user";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "reward";
        readonly type: "uint256";
    }];
    readonly name: "RewardPaid";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "previousOwner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "OwnershipTransferred";
    readonly type: "event";
}];
