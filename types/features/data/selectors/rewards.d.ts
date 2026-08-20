import type { TokenEntity } from '../entities/token';
import type { VaultEntity } from '../entities/vault';
import type { MerklRewardsCampaign, StellaSwapRewardsCampaign } from '../reducers/rewards-types';
import type { BeefyState } from '../store/types';
export type UnifiedRewardToken = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;
export type MerklRewardsCampaignWithApr = MerklRewardsCampaign & {
    apr: number;
};
export type StellaSwapRewardsCampaignWithApr = StellaSwapRewardsCampaign & {
    apr: number;
};
export declare const selectVaultActiveMerklCampaigns: ((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultHasActiveMerklCampaigns: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare function isMerklBoostCampaign(campaign: MerklRewardsCampaignWithApr): boolean;
export declare const selectVaultActiveMerklBoostCampaigns: ((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => MerklRewardsCampaignWithApr[] | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => MerklRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
    dependencies: [((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultHasActiveMerklBoostCampaigns: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => MerklRewardsCampaignWithApr[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined) => MerklRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
        dependencies: [((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
            dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
            recomputations: () => number;
            resetRecomputations: () => void;
            dependencyRecomputations: () => number;
            resetDependencyRecomputations: () => void;
        } & {
            argsMemoize: typeof import("reselect").weakMapMemoize;
            memoize: typeof import("reselect").weakMapMemoize;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultActiveStellaSwapCampaigns: ((state: BeefyState, vaultId: string) => StellaSwapRewardsCampaignWithApr[] | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => StellaSwapRewardsCampaignWithApr[] | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => StellaSwapRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => StellaSwapRewardsCampaignWithApr[] | undefined;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultHasActiveStellaSwapCampaigns: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: StellaSwapRewardsCampaignWithApr[] | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: StellaSwapRewardsCampaignWithApr[] | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState, vaultId: string) => StellaSwapRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => StellaSwapRewardsCampaignWithApr[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => StellaSwapRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => StellaSwapRewardsCampaignWithApr[] | undefined;
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultHasActiveOffchainCampaigns: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultActiveGovRewards: ((state: BeefyState, vaultId: string) => {
    index: number;
    token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
    price: BigNumber;
    apr: number;
}[] | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/contract-data/contract-data-types").RewardContractData[], resultFuncArgs_1: BigNumber, resultFuncArgs_2: {
        [tokenId: string]: BigNumber;
    }) => {
        index: number;
        token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/contract-data/contract-data-types").RewardContractData[], resultFuncArgs_1: BigNumber, resultFuncArgs_2: {
        [tokenId: string]: BigNumber;
    }) => {
        index: number;
        token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        index: number;
        token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../apis/contract-data/contract-data-types").RewardContractData[], (state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber, (state: BeefyState) => {
        [tokenId: string]: BigNumber;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultHasActiveGovRewards: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        index: number;
        token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: {
        index: number;
        token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState, vaultId: string) => {
        index: number;
        token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../apis/contract-data/contract-data-types").RewardContractData[], resultFuncArgs_1: BigNumber, resultFuncArgs_2: {
            [tokenId: string]: BigNumber;
        }) => {
            index: number;
            token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            price: BigNumber;
            apr: number;
        }[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: import("../apis/contract-data/contract-data-types").RewardContractData[], resultFuncArgs_1: BigNumber, resultFuncArgs_2: {
            [tokenId: string]: BigNumber;
        }) => {
            index: number;
            token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            price: BigNumber;
            apr: number;
        }[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            index: number;
            token: Pick<TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            price: BigNumber;
            apr: number;
        }[] | undefined;
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../apis/contract-data/contract-data-types").RewardContractData[], (state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber, (state: BeefyState) => {
            [tokenId: string]: BigNumber;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultActiveExtraRewardTokens: ((state: BeefyState, vaultId: string) => UnifiedRewardToken[] | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined, resultFuncArgs_1: StellaSwapRewardsCampaignWithApr[] | undefined) => UnifiedRewardToken[] | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: MerklRewardsCampaignWithApr[] | undefined, resultFuncArgs_1: StellaSwapRewardsCampaignWithApr[] | undefined) => UnifiedRewardToken[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => UnifiedRewardToken[] | undefined;
    dependencies: [((state: BeefyState, vaultId: string) => MerklRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => MerklRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => MerklRewardsCampaignWithApr[] | undefined;
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, ((state: BeefyState, vaultId: string) => StellaSwapRewardsCampaignWithApr[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => StellaSwapRewardsCampaignWithApr[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>) => StellaSwapRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => StellaSwapRewardsCampaignWithApr[] | undefined;
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
