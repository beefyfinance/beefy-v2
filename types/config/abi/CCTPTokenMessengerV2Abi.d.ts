export declare const CCTPTokenMessengerV2Abi: readonly [{
    readonly inputs: readonly [{
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "destinationDomain";
        readonly type: "uint32";
    }, {
        readonly name: "mintRecipient";
        readonly type: "bytes32";
    }, {
        readonly name: "burnToken";
        readonly type: "address";
    }, {
        readonly name: "destinationCaller";
        readonly type: "bytes32";
    }, {
        readonly name: "maxFee";
        readonly type: "uint256";
    }, {
        readonly name: "minFinalityThreshold";
        readonly type: "uint32";
    }];
    readonly name: "depositForBurn";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "destinationDomain";
        readonly type: "uint32";
    }, {
        readonly name: "mintRecipient";
        readonly type: "bytes32";
    }, {
        readonly name: "burnToken";
        readonly type: "address";
    }, {
        readonly name: "destinationCaller";
        readonly type: "bytes32";
    }, {
        readonly name: "maxFee";
        readonly type: "uint256";
    }, {
        readonly name: "minFinalityThreshold";
        readonly type: "uint32";
    }, {
        readonly name: "hookData";
        readonly type: "bytes";
    }];
    readonly name: "depositForBurnWithHook";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
