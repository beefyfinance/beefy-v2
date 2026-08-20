import BigNumber from 'bignumber.js';
import type { BoostReward } from '../apis/balance/balance-types';
import type { ChainEntity } from '../entities/chain';
import type { BoostPromoEntity } from '../entities/promo';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token';
import { type VaultEntity, type VaultGov } from '../entities/vault';
import type { BeefyState } from '../store/types';
import type { UserLpBreakdownBalance } from './balance-types';
export declare const selectWalletBalanceByAddress: import("re-reselect").ParametricSelector<BeefyState, string, {
    depositedVaultIds: VaultEntity["id"][];
    tokenAmount: {
        byChainId: { [chainId in ChainEntity["id"]]?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        }; };
        byBoostId: {
            [boostId: BoostPromoEntity["id"]]: {
                balance: BigNumber;
                rewards: BoostReward[];
            };
        };
        byGovVaultId: {
            [vaultId: VaultEntity["id"]]: {
                balance: BigNumber;
                rewards: import("../apis/balance/balance-types").GovVaultReward[];
            };
        };
        byVaultId: {
            [vaultId: VaultEntity["id"]]: {
                pendingWithdrawals: {
                    shares: BigNumber;
                    requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                };
            };
        };
    };
}> & {
    resultFunc: (res1: {
        [address: string]: {
            depositedVaultIds: VaultEntity["id"][];
            tokenAmount: {
                byChainId: { [chainId in ChainEntity["id"]]?: {
                    byTokenAddress: {
                        [tokenAddress: TokenEntity["address"]]: {
                            balance: BigNumber;
                        };
                    };
                }; };
                byBoostId: {
                    [boostId: BoostPromoEntity["id"]]: {
                        balance: BigNumber;
                        rewards: BoostReward[];
                    };
                };
                byGovVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        balance: BigNumber;
                        rewards: import("../apis/balance/balance-types").GovVaultReward[];
                    };
                };
                byVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        pendingWithdrawals: {
                            shares: BigNumber;
                            requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                        };
                    };
                };
            };
        };
    }, res2: string) => {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    };
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, {
        [address: string]: {
            depositedVaultIds: VaultEntity["id"][];
            tokenAmount: {
                byChainId: { [chainId in ChainEntity["id"]]?: {
                    byTokenAddress: {
                        [tokenAddress: TokenEntity["address"]]: {
                            balance: BigNumber;
                        };
                    };
                }; };
                byBoostId: {
                    [boostId: BoostPromoEntity["id"]]: {
                        balance: BigNumber;
                        rewards: BoostReward[];
                    };
                };
                byGovVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        balance: BigNumber;
                        rewards: import("../apis/balance/balance-types").GovVaultReward[];
                    };
                };
                byVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        pendingWithdrawals: {
                            shares: BigNumber;
                            requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                        };
                    };
                };
            };
        };
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    }, (res1: {
        [address: string]: {
            depositedVaultIds: VaultEntity["id"][];
            tokenAmount: {
                byChainId: { [chainId in ChainEntity["id"]]?: {
                    byTokenAddress: {
                        [tokenAddress: TokenEntity["address"]]: {
                            balance: BigNumber;
                        };
                    };
                }; };
                byBoostId: {
                    [boostId: BoostPromoEntity["id"]]: {
                        balance: BigNumber;
                        rewards: BoostReward[];
                    };
                };
                byGovVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        balance: BigNumber;
                        rewards: import("../apis/balance/balance-types").GovVaultReward[];
                    };
                };
                byVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        pendingWithdrawals: {
                            shares: BigNumber;
                            requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                        };
                    };
                };
            };
        };
    }, res2: string) => {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    }, [import("re-reselect").ParametricSelector<BeefyState, string, {
        [address: string]: {
            depositedVaultIds: VaultEntity["id"][];
            tokenAmount: {
                byChainId: { [chainId in ChainEntity["id"]]?: {
                    byTokenAddress: {
                        [tokenAddress: TokenEntity["address"]]: {
                            balance: BigNumber;
                        };
                    };
                }; };
                byBoostId: {
                    [boostId: BoostPromoEntity["id"]]: {
                        balance: BigNumber;
                        rewards: BoostReward[];
                    };
                };
                byGovVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        balance: BigNumber;
                        rewards: import("../apis/balance/balance-types").GovVaultReward[];
                    };
                };
                byVaultId: {
                    [vaultId: VaultEntity["id"]]: {
                        pendingWithdrawals: {
                            shares: BigNumber;
                            requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                        };
                    };
                };
            };
        };
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectAllTokenWhereUserCouldHaveBalance: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => string[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    }) => string[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    }) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"]) => {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectHasWalletBalanceBeenFetched: (state: BeefyState, walletAddress: string) => boolean;
export declare const selectUserDepositedVaultIds: (state: BeefyState, walletAddress?: string) => string[];
export declare const selectUserHasDepositedInAnyVault: ((state: BeefyState, walletAddress?: string | undefined) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: string[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, walletAddress?: string) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectUserDepositedVaultIdsForAsset: (state: BeefyState, asset: string) => string[];
export declare const selectHasUserDepositedOnChain: ((state: BeefyState, _chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", walletAddress?: string | undefined) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: string[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: string[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, _chainId: ChainEntity["id"], walletAddress?: string) => string[], (state: BeefyState, chainId: ChainEntity["id"]) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectHasUserDepositInVault: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectUserBalanceOfToken: (state: BeefyState, chainId: ChainEntity["id"], tokenAddress: TokenEntity["address"], walletAddress?: string) => BigNumber;
/**
 * Directly held shares only, excludes any shares deposited in boosts or bridged to another chain
 * (For gov vaults this will be in deposit token since there are no shares)
 */
export declare const selectUserVaultBalanceInShareToken: (state: BeefyState, vaultId: VaultEntity["id"], maybeWalletAddress?: string) => BigNumber;
/**
 * Only includes shares deposited in boosts
 */
export declare const selectUserVaultBalanceInShareTokenInBoosts: ((state: BeefyState, _vaultId: string, maybeWalletAddress?: string | undefined) => BigNumber) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [boostId: string]: {
            balance: BigNumber;
            rewards: BoostReward[];
        };
    } | undefined, resultFuncArgs_1: string[]) => BigNumber;
    memoizedResultFunc: ((resultFuncArgs_0: {
        [boostId: string]: {
            balance: BigNumber;
            rewards: BoostReward[];
        };
    } | undefined, resultFuncArgs_1: string[]) => BigNumber) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => BigNumber;
    dependencies: [(state: BeefyState, _vaultId: VaultEntity["id"], maybeWalletAddress?: string) => {
        [boostId: string]: {
            balance: BigNumber;
            rewards: BoostReward[];
        };
    } | undefined, (state: BeefyState, vaultId: VaultEntity["id"]) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
/**
 * Only includes shares deposited in boosts, converted to deposit token
 */
export declare const selectUserVaultBalanceInDepositTokenInBoosts: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Only includes shares deposited in current boost
 */
export declare const selectUserVaultBalanceInShareTokenInCurrentBoost: ((state: BeefyState, _vaultId: string, maybeWalletAddress?: string | undefined) => BigNumber) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [boostId: string]: {
            balance: BigNumber;
            rewards: BoostReward[];
        };
    } | undefined, resultFuncArgs_1: string | undefined) => BigNumber;
    memoizedResultFunc: ((resultFuncArgs_0: {
        [boostId: string]: {
            balance: BigNumber;
            rewards: BoostReward[];
        };
    } | undefined, resultFuncArgs_1: string | undefined) => BigNumber) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => BigNumber;
    dependencies: [(state: BeefyState, _vaultId: VaultEntity["id"], maybeWalletAddress?: string) => {
        [boostId: string]: {
            balance: BigNumber;
            rewards: BoostReward[];
        };
    } | undefined, (state: BeefyState, vaultId: VaultEntity["id"]) => string | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
/**
 * Only includes shares bridged to another chain
 */
export declare const selectUserVaultBalanceInShareTokenInBridged: ((state: BeefyState, _vaultId: string, maybeWalletAddress?: string | undefined) => BigNumber) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        ethereum?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        polygon?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        bsc?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        optimism?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fantom?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        arbitrum?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        avax?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        cronos?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        moonbeam?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        moonriver?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        metis?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fuse?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        kava?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        canto?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        zksync?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        zkevm?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        base?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        gnosis?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        linea?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        mantle?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fraxtal?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        mode?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        manta?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        real?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        sei?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        rootstock?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        scroll?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        lisk?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        sonic?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        aurora?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        emerald?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        berachain?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        celo?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        heco?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        harmony?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        saga?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        hyperevm?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        plasma?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        monad?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        megaeth?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        robinhood?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
    } | undefined, resultFuncArgs_1: ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })) => BigNumber;
    memoizedResultFunc: ((resultFuncArgs_0: {
        ethereum?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        polygon?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        bsc?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        optimism?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fantom?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        arbitrum?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        avax?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        cronos?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        moonbeam?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        moonriver?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        metis?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fuse?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        kava?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        canto?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        zksync?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        zkevm?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        base?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        gnosis?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        linea?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        mantle?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fraxtal?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        mode?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        manta?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        real?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        sei?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        rootstock?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        scroll?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        lisk?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        sonic?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        aurora?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        emerald?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        berachain?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        celo?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        heco?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        harmony?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        saga?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        hyperevm?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        plasma?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        monad?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        megaeth?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        robinhood?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
    } | undefined, resultFuncArgs_1: ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })) => BigNumber) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => BigNumber;
    dependencies: [(state: BeefyState, _vaultId: VaultEntity["id"], maybeWalletAddress?: string) => {
        ethereum?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        polygon?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        bsc?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        optimism?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fantom?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        arbitrum?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        avax?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        cronos?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        moonbeam?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        moonriver?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        metis?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fuse?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        kava?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        canto?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        zksync?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        zkevm?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        base?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        gnosis?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        linea?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        mantle?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        fraxtal?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        mode?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        manta?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        real?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        sei?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        rootstock?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        scroll?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        lisk?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        sonic?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        aurora?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        emerald?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        berachain?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        celo?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        heco?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        harmony?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        saga?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        hyperevm?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        plasma?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        monad?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        megaeth?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
        robinhood?: {
            byTokenAddress: {
                [tokenAddress: TokenEntity["address"]]: {
                    balance: BigNumber;
                };
            };
        } | undefined;
    } | undefined, (state: BeefyState, vaultId: VaultEntity["id"]) => ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectUserVaultPendingWithdrawalOrUndefined: (state: BeefyState, vaultId: VaultEntity["id"], maybeWalletAddress?: string) => {
    shares: BigNumber;
    requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
} | undefined;
export declare const selectUserVaultPendingWithdrawal: (state: BeefyState, vaultId: VaultEntity["id"], maybeWalletAddress?: string) => {
    shares: BigNumber;
    requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
};
export declare const selectAddressHasVaultPendingWithdrawal: ((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => false | "pending" | "claimable") & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        shares: BigNumber;
        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
    } | undefined, resultFuncArgs_1: number) => false | "pending" | "claimable";
    memoizedResultFunc: ((resultFuncArgs_0: {
        shares: BigNumber;
        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
    } | undefined, resultFuncArgs_1: number) => false | "pending" | "claimable") & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => false | "pending" | "claimable";
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => {
        shares: BigNumber;
        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
    } | undefined, (_state: BeefyState) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
/**
 * Only includes shares pending withdrawal
 */
export declare const selectUserVaultBalanceInShareTokenPendingWithdrawal: ((state: BeefyState, vaultId: string, maybeWalletAddress?: string | undefined) => BigNumber) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: BigNumber | undefined) => BigNumber;
    memoizedResultFunc: ((resultFuncArgs_0: BigNumber | undefined) => BigNumber) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => BigNumber;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"], maybeWalletAddress?: string) => BigNumber | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultSharesToDepositTokenData: import("re-reselect").ParametricSelector<BeefyState, string, {
    ppfs: BigNumber;
    shareToken: TokenEntity;
    depositToken: TokenEntity;
} | {
    depositToken: TokenEntity;
    ppfs?: undefined;
    shareToken?: undefined;
}> & {
    resultFunc: (res1: ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }), res2: BigNumber | null | undefined, res3: TokenEntity | undefined, res4: TokenEntity | undefined) => {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    };
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber | null | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, TokenEntity | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, TokenEntity | undefined>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }, (res1: ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }), res2: BigNumber | null | undefined, res3: TokenEntity | undefined, res4: TokenEntity | undefined) => {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }, [import("re-reselect").ParametricSelector<BeefyState, string, ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber | null | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, TokenEntity | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, TokenEntity | undefined>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Total shares including boosts (excludes bridged and pending withdrawal)
 * (For gov vaults this will be in deposit token since there are no shares)
 */
export declare const selectUserVaultBalanceInShareTokenIncludingBoosts: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: BigNumber) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: BigNumber) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Total shares including boosts, bridged and pending withdrawal
 * (For gov vaults this will be in deposit token since there are no shares)
 */
export declare const selectUserVaultBalanceInShareTokenIncludingDisplaced: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: BigNumber, res3: BigNumber, res4: BigNumber) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: BigNumber, res3: BigNumber, res4: BigNumber) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Whether to show the "Migrate" tag/gradient for a vault: it must be the OLD wrapper of a
 * replacement-vault migration AND the user must hold a non-zero balance in it (including boost and
 * displaced shares). Lives here (not in selectors/vaults) because it depends on user balances.
 */
export declare const selectUserHasBalanceToMigrate: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
/**
 * Total not in active boost
 * Does not include pending withdrawal
 */
export declare const selectUserVaultBalanceNotInActiveBoostInShareToken: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: BigNumber, res3: BigNumber, res4: BigNumber, res5: boolean) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, boolean>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: BigNumber, res3: BigNumber, res4: BigNumber, res5: boolean) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, boolean>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 */
export declare const selectUserVaultBalanceInDepositToken: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Total not in active boost, converted to deposit token
 */
export declare const selectUserVaultBalanceNotInActiveBoostInDepositToken: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Balance converted to deposit token, including in boosts, bridged and pending withdrawal
 */
export declare const selectUserVaultBalanceInDepositTokenIncludingDisplaced: import("re-reselect").ParametricSelector<BeefyState, string, BigNumber> & {
    resultFunc: (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BigNumber, (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export declare const selectUserVaultBalanceInDepositTokenWithToken: import("re-reselect").ParametricSelector<BeefyState, string, {
    token: TokenEntity;
    amount: BigNumber;
}> & {
    resultFunc: (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => {
        token: TokenEntity;
        amount: BigNumber;
    };
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, {
        token: TokenEntity;
        amount: BigNumber;
    }, (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => {
        token: TokenEntity;
        amount: BigNumber;
    }, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
/**
 * Balance converted to deposit token, including in boosts, bridged and pending withdrawal
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export declare const selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken: import("re-reselect").ParametricSelector<BeefyState, string, {
    token: TokenEntity;
    amount: BigNumber;
}> & {
    resultFunc: (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => {
        token: TokenEntity;
        amount: BigNumber;
    };
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, {
        token: TokenEntity;
        amount: BigNumber;
    }, (res1: BigNumber, res2: {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }) => {
        token: TokenEntity;
        amount: BigNumber;
    }, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ppfs: BigNumber;
        shareToken: TokenEntity;
        depositToken: TokenEntity;
    } | {
        depositToken: TokenEntity;
        ppfs?: undefined;
        shareToken?: undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export type UserVaultBalanceBreakdownVault = {
    type: 'vault';
    id: string;
    amount: BigNumber;
    vaultId: VaultEntity['id'];
};
export type UserVaultBalanceBreakdownBoost = {
    type: 'boost';
    id: string;
    amount: BigNumber;
    boostId: BoostPromoEntity['id'];
};
export type UserVaultBalanceBreakdownBridged = {
    type: 'bridged';
    id: string;
    amount: BigNumber;
    chainId: ChainEntity['id'];
};
export type UserVaultBalanceBreakdownPendingWithdrawal = {
    type: 'pending-withdrawal';
    id: string;
    amount: BigNumber;
    vaultId: VaultEntity['id'];
};
export type UserVaultBalanceBreakdownEntry = UserVaultBalanceBreakdownVault | UserVaultBalanceBreakdownBoost | UserVaultBalanceBreakdownBridged | UserVaultBalanceBreakdownPendingWithdrawal;
export type UserVaultBalanceBreakdown = {
    depositToken: TokenEntity;
    entries: UserVaultBalanceBreakdownEntry[];
};
export declare const selectVaultUserBalanceInDepositTokenBreakdown: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => UserVaultBalanceBreakdown;
export declare const selectGovVaultUserStakedBalanceInDepositToken: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => BigNumber;
export declare const selectBoostUserBalanceInToken: (state: BeefyState, boostId: BoostPromoEntity["id"], walletAddress?: string) => BigNumber;
export declare const selectBoostUserRewardsInToken: (state: BeefyState, boostId: BoostPromoEntity["id"], walletAddress?: string) => BoostReward[];
/**
 * Vault balance converted to USD, including in boosts and bridged tokens
 */
export declare const selectUserVaultBalanceInUsdIncludingDisplaced: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => BigNumber;
/**
 * Balance of vault deposit token in users wallet converted to USD
 */
export declare const selectUserVaultDepositTokenWalletBalanceInUsd: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => BigNumber;
/** @dev will NOT default to connected wallet address */
export declare const selectGovVaultPendingRewards: ((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => {
    token: TokenEntity;
    amount: BigNumber;
}[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/balance/balance-types").GovVaultReward[] | undefined, resultFuncArgs_1: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => {
        token: TokenEntity;
        amount: BigNumber;
    }[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/balance/balance-types").GovVaultReward[] | undefined, resultFuncArgs_1: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => {
        token: TokenEntity;
        amount: BigNumber;
    }[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        token: TokenEntity;
        amount: BigNumber;
    }[];
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => import("../apis/balance/balance-types").GovVaultReward[] | undefined, (state: BeefyState, _vaultId: VaultEntity["id"], _walletAddress?: string) => {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
/** @dev will NOT default to connected wallet address */
export declare const selectGovVaultPendingRewardsWithPrice: ((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => {
    price: BigNumber;
    token: TokenEntity;
    amount: BigNumber;
}[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        token: TokenEntity;
        amount: BigNumber;
    }[], resultFuncArgs_1: {
        [tokenId: string]: BigNumber;
    }) => {
        price: BigNumber;
        token: TokenEntity;
        amount: BigNumber;
    }[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        token: TokenEntity;
        amount: BigNumber;
    }[], resultFuncArgs_1: {
        [tokenId: string]: BigNumber;
    }) => {
        price: BigNumber;
        token: TokenEntity;
        amount: BigNumber;
    }[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        price: BigNumber;
        token: TokenEntity;
        amount: BigNumber;
    }[];
    dependencies: [((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => {
        token: TokenEntity;
        amount: BigNumber;
    }[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../apis/balance/balance-types").GovVaultReward[] | undefined, resultFuncArgs_1: {
            ethereum?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            polygon?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            bsc?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            optimism?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fantom?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            arbitrum?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            avax?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            cronos?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            moonbeam?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            moonriver?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            metis?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fuse?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            kava?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            canto?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            zksync?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            zkevm?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            base?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            gnosis?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            linea?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            mantle?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fraxtal?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            mode?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            manta?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            real?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            sei?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            rootstock?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            scroll?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            lisk?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            sonic?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            aurora?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            emerald?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            berachain?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            celo?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            heco?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            harmony?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            saga?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            hyperevm?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            plasma?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            monad?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            megaeth?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            robinhood?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
        }) => {
            token: TokenEntity;
            amount: BigNumber;
        }[];
        memoizedResultFunc: ((resultFuncArgs_0: import("../apis/balance/balance-types").GovVaultReward[] | undefined, resultFuncArgs_1: {
            ethereum?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            polygon?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            bsc?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            optimism?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fantom?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            arbitrum?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            avax?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            cronos?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            moonbeam?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            moonriver?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            metis?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fuse?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            kava?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            canto?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            zksync?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            zkevm?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            base?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            gnosis?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            linea?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            mantle?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fraxtal?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            mode?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            manta?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            real?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            sei?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            rootstock?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            scroll?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            lisk?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            sonic?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            aurora?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            emerald?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            berachain?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            celo?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            heco?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            harmony?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            saga?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            hyperevm?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            plasma?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            monad?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            megaeth?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            robinhood?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
        }) => {
            token: TokenEntity;
            amount: BigNumber;
        }[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            token: TokenEntity;
            amount: BigNumber;
        }[];
        dependencies: [(state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => import("../apis/balance/balance-types").GovVaultReward[] | undefined, (state: BeefyState, _vaultId: VaultEntity["id"], _walletAddress?: string) => {
            ethereum?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            polygon?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            bsc?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            optimism?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fantom?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            arbitrum?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            avax?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            cronos?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            moonbeam?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            moonriver?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            metis?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fuse?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            kava?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            canto?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            zksync?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            zkevm?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            base?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            gnosis?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            linea?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            mantle?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            fraxtal?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            mode?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            manta?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            real?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            sei?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            rootstock?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            scroll?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            lisk?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            sonic?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            aurora?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            emerald?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            berachain?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            celo?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            heco?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            harmony?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            saga?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            hyperevm?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            plasma?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            monad?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            megaeth?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
            robinhood?: {
                byId: {
                    [id: string]: TokenEntity["address"];
                };
                byAddress: {
                    [address: string]: TokenEntity;
                };
                native: import("../entities/token").TokenNative["id"] | undefined;
                wnative: import("../entities/token").TokenErc20["id"] | undefined;
                interestingBalanceTokenAddresses: TokenEntity["address"][];
                tokenIdsInActiveVaults: TokenEntity["id"][];
            } | undefined;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, (state: BeefyState, _vaultId: VaultEntity["id"], _walletAddress?: string) => {
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
/**
 * Get the token for which the boost balance is expressed in
 * for boosts, balance is the amount of earnedToken of the target vault
 */
export declare const selectBoostBalanceTokenEntity: (state: BeefyState, boostId: BoostPromoEntity["id"]) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative;
/**
 * Get the token for which the gov vault balance is expressed in
 * for gov vault, balance is the amount of oracleId token
 */
export declare const selectGovVaultBalanceTokenEntity: (state: BeefyState, vaultId: VaultGov["id"]) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative;
/**
 * Get the token for which the gov vault rewards are expressed in
 * for gov vault, rewards is an amount in earnedTokenId
 */
export declare const selectGovVaultRewardsTokenEntity: (state: BeefyState, vaultId: VaultGov["id"]) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative;
export declare const selectLpBreakdownBalance: (state: BeefyState, breakdown: TokenLpBreakdown, balance: BigNumber, chainId: ChainEntity["id"]) => {
    assets: ({
        totalAmount: BigNumber;
        userAmount: BigNumber;
        totalValue: BigNumber;
        userValue: BigNumber;
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "erc20";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        bridge?: string;
        tags: string[];
    } | {
        totalAmount: BigNumber;
        userAmount: BigNumber;
        totalValue: BigNumber;
        userValue: BigNumber;
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "native";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        tags: string[];
    })[];
    userShareOfPool: BigNumber;
    lpTotalSupplyDecimal: BigNumber;
};
export declare const selectTreasuryV3PositionBreakdown: (state: BeefyState, breakdown: TokenLpBreakdown, chainId: ChainEntity["id"]) => {
    assets: ({
        userValue: string;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "erc20";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        bridge?: string;
        tags: string[];
    } | {
        userValue: string;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "native";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        tags: string[];
    })[];
};
export declare const selectUserLpBreakdownBalance: (state: BeefyState, vault: VaultEntity, breakdown: TokenLpBreakdown, walletAddress?: string) => UserLpBreakdownBalance;
export declare const selectUserUnstakedClms: ((state: BeefyState, walletAddress?: string | undefined) => string[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    } | undefined, resultFuncArgs_1: import("../entities/vault").VaultCowcentrated[]) => string[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    } | undefined, resultFuncArgs_1: import("../entities/vault").VaultCowcentrated[]) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(state: BeefyState, walletAddress?: string) => {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    } | undefined, ((state: BeefyState) => import("../entities/vault").VaultCowcentrated[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: {
            [x: string]: VaultEntity | undefined;
        }) => import("../entities/vault").VaultCowcentrated[];
        memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: {
            [x: string]: VaultEntity | undefined;
        }) => import("../entities/vault").VaultCowcentrated[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("../entities/vault").VaultCowcentrated[];
        dependencies: [(state: BeefyState) => string[], (state: BeefyState) => {
            [x: string]: VaultEntity | undefined;
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
export declare const selectUserIsUnstakedForVaultId: ((state: BeefyState, _vaultId: string, walletAddress?: string | undefined) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    } | undefined, resultFuncArgs_1: ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    } | undefined, resultFuncArgs_1: ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, _vaultId: string, walletAddress?: string) => {
        depositedVaultIds: VaultEntity["id"][];
        tokenAmount: {
            byChainId: { [chainId in ChainEntity["id"]]?: {
                byTokenAddress: {
                    [tokenAddress: TokenEntity["address"]]: {
                        balance: BigNumber;
                    };
                };
            }; };
            byBoostId: {
                [boostId: BoostPromoEntity["id"]]: {
                    balance: BigNumber;
                    rewards: BoostReward[];
                };
            };
            byGovVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    balance: BigNumber;
                    rewards: import("../apis/balance/balance-types").GovVaultReward[];
                };
            };
            byVaultId: {
                [vaultId: VaultEntity["id"]]: {
                    pendingWithdrawals: {
                        shares: BigNumber;
                        requests: import("../apis/balance/balance-types").Erc4626PendingBalanceRequest[];
                    };
                };
            };
        };
    } | undefined, (state: BeefyState, vaultId: string) => ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
        subType: "standard";
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "standard";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "single";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
        subType: "gov";
        contractType: "multi";
        receiptTokenAddress: string;
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "gov";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
        receiptTokenAddress: string;
        contractType: "multi";
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "cowcentrated";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
        subType: "cowcentrated";
        receiptTokenAddress: string;
        depositTokenAddress: string;
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    }) | ({
        type: "erc4626";
    } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
        subType: "erc7540:withdraw";
    })];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsUserBalanceAvailable: ((state: BeefyState, _walletAddress: string | undefined) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: {
        ethereum?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        polygon?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        bsc?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        optimism?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fantom?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        arbitrum?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        avax?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        cronos?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        moonbeam?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        moonriver?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        metis?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fuse?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        kava?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        canto?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        zksync?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        zkevm?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        base?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        gnosis?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        linea?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        mantle?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fraxtal?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        mode?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        manta?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        real?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        sei?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        rootstock?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        scroll?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        lisk?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        sonic?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        aurora?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        emerald?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        berachain?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        celo?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        heco?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        harmony?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        saga?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        hyperevm?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        plasma?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        monad?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        megaeth?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        robinhood?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
    }, resultFuncArgs_3: {
        [address: string]: {
            global: import("../reducers/data-loader-types").ByAddressGlobalDataEntity;
            byChainId: { [chainId in ChainEntity["id"]]?: import("../reducers/data-loader-types").ByAddressByChainDataEntity; };
        };
    }, resultFuncArgs_4: string | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: {
        ethereum?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        polygon?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        bsc?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        optimism?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fantom?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        arbitrum?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        avax?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        cronos?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        moonbeam?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        moonriver?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        metis?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fuse?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        kava?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        canto?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        zksync?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        zkevm?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        base?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        gnosis?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        linea?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        mantle?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fraxtal?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        mode?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        manta?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        real?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        sei?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        rootstock?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        scroll?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        lisk?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        sonic?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        aurora?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        emerald?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        berachain?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        celo?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        heco?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        harmony?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        saga?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        hyperevm?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        plasma?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        monad?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        megaeth?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        robinhood?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
    }, resultFuncArgs_3: {
        [address: string]: {
            global: import("../reducers/data-loader-types").ByAddressGlobalDataEntity;
            byChainId: { [chainId in ChainEntity["id"]]?: import("../reducers/data-loader-types").ByAddressByChainDataEntity; };
        };
    }, resultFuncArgs_4: string | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, _walletAddress: string | undefined) => boolean, (state: BeefyState, _walletAddress: string | undefined) => boolean, (state: BeefyState, _walletAddress: string | undefined) => {
        ethereum?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        polygon?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        bsc?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        optimism?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fantom?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        arbitrum?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        avax?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        cronos?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        moonbeam?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        moonriver?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        metis?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fuse?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        kava?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        canto?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        zksync?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        zkevm?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        base?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        gnosis?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        linea?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        mantle?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        fraxtal?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        mode?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        manta?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        real?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        sei?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        rootstock?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        scroll?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        lisk?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        sonic?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        aurora?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        emerald?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        berachain?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        celo?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        heco?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        harmony?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        saga?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        hyperevm?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        plasma?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        monad?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        megaeth?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
        robinhood?: import("../reducers/data-loader-types").ByChainDataEntity | undefined;
    }, (state: BeefyState, _walletAddress: string | undefined) => {
        [address: string]: {
            global: import("../reducers/data-loader-types").ByAddressGlobalDataEntity;
            byChainId: { [chainId in ChainEntity["id"]]?: import("../reducers/data-loader-types").ByAddressByChainDataEntity; };
        };
    }, (_state: BeefyState, walletAddress: string | undefined) => string | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPastBoostIdsWithUserBalance: (state: BeefyState, vaultId: VaultEntity["id"]) => string[];
export declare const selectDepositOptionTokensBalanceByChainId: (state: BeefyState, chainId: ChainEntity["id"], walletAddress: string) => BigNumber;
