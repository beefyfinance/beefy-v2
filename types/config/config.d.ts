export declare const config: {
    arbitrum: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
        };
    };
    avax: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            priorityMinimum: string;
            baseSafetyMargin: number;
        };
    };
    base: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    bsc: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
            minimum: string;
        };
    };
    ethereum: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            priorityMinimum: string;
            baseSafetyMargin: number;
        };
    };
    fraxtal: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0x0955479C61B37074d689319fCaA84ffE1E9e8CF5";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    gnosis: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    hyperevm: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    linea: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseMinimum: string;
            baseSafetyMargin: number;
        };
    };
    megaeth: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    robinhood: {
        new: true;
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
        };
    };
    monad: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    optimism: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
            minimum: string;
        };
    };
    plasma: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    polygon: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            priorityMinimum: string;
            baseSafetyMargin: number;
        };
    };
    rootstock: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        new: false;
        gas: {
            type: "standard";
        };
    };
    sonic: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            priorityMinimum: string;
            baseSafetyMargin: number;
        };
        brand: {
            icon: "gradient";
            header: "gradient";
        };
    };
    zksync: {
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        explorerTokenUrlTemplate: string;
        multicall3Address: "0x9A04a9e1d67151AB1E742E6D8965e0602410f91d";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    berachain: {
        eol: number;
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    sei: {
        eol: number;
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
            minimum: string;
        };
    };
    lisk: {
        eol: number;
        name: string;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    metis: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    mantle: {
        name: string;
        eol: number;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    cronos: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
        };
    };
    saga: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0x864DDc9B50B9A0dF676d826c9B9EDe9F8913a160";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "gasless";
        };
    };
    moonbeam: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
        };
    };
    mode: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    scroll: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    fantom: {
        name: string;
        eol: number;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            priorityMinimum: string;
            baseSafetyMargin: number;
        };
    };
    canto: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    kava: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    manta: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    real: {
        name: string;
        chainId: number;
        eol: number;
        disabled: true;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
            priorityMinimum: string;
        };
    };
    zkevm: {
        name: string;
        eol: number;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    fuse: {
        name: string;
        eol: number;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    moonriver: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
        };
    };
    aurora: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    emerald: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
    celo: {
        name: string;
        chainId: number;
        eol: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "celo";
        };
    };
    heco: {
        name: string;
        eol: number;
        disabled: true;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "eip1559";
            blocks: number;
            percentile: number;
            baseSafetyMargin: number;
        };
    };
    harmony: {
        name: string;
        eol: number;
        disabled: true;
        chainId: number;
        rpc: string[];
        explorerUrl: string;
        multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        appMulticallContractAddress: string;
        native: {
            symbol: string;
            oracleId: string;
            decimals: number;
        };
        gas: {
            type: "standard";
        };
    };
};
