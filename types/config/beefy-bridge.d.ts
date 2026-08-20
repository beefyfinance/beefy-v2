import BigNumber from 'bignumber.js';
export declare const beefyBridgeConfig: {
    readonly source: {
        readonly id: "mooBIFI";
        readonly symbol: "mooBIFI";
        readonly oracleId: "mooBIFI";
        readonly address: "0xBEEF8e0982874e0292E6C5751C5A4092b3e1BEEF";
        readonly chainId: "ethereum";
        readonly decimals: 18;
    };
    readonly tokens: {
        readonly ethereum: "0xb1feA302f3B2E93FA04E46dCCE35F2Fc522d7bB9";
        readonly optimism: "0xc55E93C62874D8100dBd2DfE307EDc1036ad5434";
        readonly base: "0xc55E93C62874D8100dBd2DfE307EDc1036ad5434";
        readonly sonic: "0xc55E93C62874D8100dBd2DfE307EDc1036ad5434";
    };
    readonly bridges: readonly [{
        readonly id: "axelar";
        readonly title: "Axelar";
        readonly explorerUrl: "https://axelarscan.io/gmp/{{hash}}";
        readonly chains: {
            readonly ethereum: {
                readonly bridge: "0xaaa6A279fC98b9bF94bD479C90D701417e361fc2";
                readonly time: {
                    readonly outgoing: 20;
                    readonly incoming: 2;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
            readonly optimism: {
                readonly bridge: "0xaaa6A279fC98b9bF94bD479C90D701417e361fc2";
                readonly time: {
                    readonly outgoing: 30;
                    readonly incoming: 2;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
            readonly base: {
                readonly bridge: "0xaaa6A279fC98b9bF94bD479C90D701417e361fc2";
                readonly time: {
                    readonly outgoing: 30;
                    readonly incoming: 2;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
        };
    }, {
        readonly id: "layer-zero";
        readonly title: "LayerZero";
        readonly explorerUrl: "https://layerzeroscan.com/tx/{{hash}}";
        readonly chains: {
            readonly ethereum: {
                readonly bridge: "0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051";
                readonly time: {
                    readonly outgoing: 1;
                    readonly incoming: 4;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
            readonly optimism: {
                readonly bridge: "0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051";
                readonly time: {
                    readonly outgoing: 1;
                    readonly incoming: 4;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
            readonly base: {
                readonly bridge: "0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051";
                readonly time: {
                    readonly outgoing: 1;
                    readonly incoming: 4;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
            readonly sonic: {
                readonly bridge: "0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051";
                readonly receiveDisabled: true;
                readonly time: {
                    readonly outgoing: 1;
                    readonly incoming: 4;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
        };
    }, {
        readonly id: "optimism";
        readonly title: "Optimism";
        readonly chains: {
            readonly ethereum: {
                readonly bridge: "0xbbb8971aEA2627fa2E1342bb5Bf952Ec521479f2";
                readonly receiveDisabled: true;
                readonly time: {
                    readonly outgoing: 2;
                    readonly incoming: 0;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
            readonly optimism: {
                readonly bridge: "0xbbb8971aEA2627fa2E1342bb5Bf952Ec521479f2";
                readonly sendDisabled: true;
                readonly time: {
                    readonly outgoing: 10080;
                    readonly incoming: 0;
                };
                readonly gasLimits: {
                    readonly approve: BigNumber;
                    readonly outgoing: BigNumber;
                    readonly incoming: BigNumber;
                };
            };
        };
    }];
};
