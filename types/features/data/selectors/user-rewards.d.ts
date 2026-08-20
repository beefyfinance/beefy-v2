import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain';
import { type VaultEntity } from '../entities/vault';
import type { MerklVaultReward } from '../reducers/wallet/user-rewards-types';
import type { BeefyState } from '../store/types';
import { type UnifiedRewardToken } from './rewards';
export type UnifiedReward = {
    active: boolean;
    amount: BigNumber;
    token: UnifiedRewardToken;
    price: BigNumber | undefined;
    apr: number | undefined;
};
export declare function selectUserMerklUnifiedRewardsForVault(state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string): UnifiedReward[] | undefined;
export declare function selectUserMerklUnifiedRewardsForChain(state: BeefyState, chainId: ChainEntity['id'], walletAddress: string): UnifiedReward[] | undefined;
export declare function selectMayHaveOffchainUserRewards(_state: BeefyState, vault: VaultEntity): boolean;
export declare const selectUserMerklRewardsForVault: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress: string) => MerklVaultReward[];
export declare const selectConnectedUserHasMerklRewardsForVault: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: MerklVaultReward[] | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: MerklVaultReward[] | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState, vaultId: string) => MerklVaultReward[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
            [userAddress: string]: {
                byProvider: {
                    merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                    stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                };
            };
        }, resultFuncArgs_2: string | undefined) => MerklVaultReward[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
            [userAddress: string]: {
                byProvider: {
                    merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                    stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                };
            };
        }, resultFuncArgs_2: string | undefined) => MerklVaultReward[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => MerklVaultReward[] | undefined;
        dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => {
            [userAddress: string]: {
                byProvider: {
                    merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                    stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                };
            };
        }, (state: BeefyState) => string | undefined];
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
export declare function selectUserStellaSwapUnifiedRewardsForVault(state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string): UnifiedReward[] | undefined;
export declare const selectUserStellaSwapRewardsForVault: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress: string) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[];
export declare const selectConnectedUserHasStellaSwapRewardsForVault: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState, vaultId: string) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
            [userAddress: string]: {
                byProvider: {
                    merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                    stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                };
            };
        }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined;
        memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
            [userAddress: string]: {
                byProvider: {
                    merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                    stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                };
            };
        }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined;
        dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => {
            [userAddress: string]: {
                byProvider: {
                    merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                    stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                };
            };
        }, (state: BeefyState) => string | undefined];
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
export declare const selectConnectedUserHasGovRewardsForVault: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => boolean;
export declare const selectUserGovVaultUnifiedRewards: ((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => UnifiedReward[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        price: BigNumber;
        token: import("../entities/token").TokenEntity;
        amount: BigNumber;
    }[], resultFuncArgs_1: {
        index: number;
        token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined) => UnifiedReward[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        price: BigNumber;
        token: import("../entities/token").TokenEntity;
        amount: BigNumber;
    }[], resultFuncArgs_1: {
        index: number;
        token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined) => UnifiedReward[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => UnifiedReward[];
    dependencies: [((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => {
        price: BigNumber;
        token: import("../entities/token").TokenEntity;
        amount: BigNumber;
    }[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: {
            token: import("../entities/token").TokenEntity;
            amount: BigNumber;
        }[], resultFuncArgs_1: {
            [tokenId: string]: BigNumber;
        }) => {
            price: BigNumber;
            token: import("../entities/token").TokenEntity;
            amount: BigNumber;
        }[];
        memoizedResultFunc: ((resultFuncArgs_0: {
            token: import("../entities/token").TokenEntity;
            amount: BigNumber;
        }[], resultFuncArgs_1: {
            [tokenId: string]: BigNumber;
        }) => {
            price: BigNumber;
            token: import("../entities/token").TokenEntity;
            amount: BigNumber;
        }[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            price: BigNumber;
            token: import("../entities/token").TokenEntity;
            amount: BigNumber;
        }[];
        dependencies: [((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => {
            token: import("../entities/token").TokenEntity;
            amount: BigNumber;
        }[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("../apis/balance/balance-types").GovVaultReward[] | undefined, resultFuncArgs_1: {
                ethereum?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                polygon?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                bsc?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                optimism?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fantom?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                arbitrum?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                avax?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                cronos?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                moonbeam?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                moonriver?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                metis?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fuse?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                kava?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                canto?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                zksync?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                zkevm?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                base?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                gnosis?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                linea?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                mantle?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fraxtal?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                mode?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                manta?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                real?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                sei?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                rootstock?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                scroll?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                lisk?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                sonic?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                aurora?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                emerald?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                berachain?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                celo?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                heco?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                harmony?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                saga?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                hyperevm?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                plasma?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                monad?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                megaeth?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                robinhood?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
            }) => {
                token: import("../entities/token").TokenEntity;
                amount: BigNumber;
            }[];
            memoizedResultFunc: ((resultFuncArgs_0: import("../apis/balance/balance-types").GovVaultReward[] | undefined, resultFuncArgs_1: {
                ethereum?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                polygon?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                bsc?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                optimism?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fantom?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                arbitrum?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                avax?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                cronos?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                moonbeam?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                moonriver?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                metis?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fuse?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                kava?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                canto?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                zksync?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                zkevm?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                base?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                gnosis?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                linea?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                mantle?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fraxtal?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                mode?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                manta?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                real?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                sei?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                rootstock?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                scroll?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                lisk?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                sonic?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                aurora?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                emerald?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                berachain?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                celo?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                heco?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                harmony?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                saga?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                hyperevm?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                plasma?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                monad?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                megaeth?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                robinhood?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
            }) => {
                token: import("../entities/token").TokenEntity;
                amount: BigNumber;
            }[]) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => {
                token: import("../entities/token").TokenEntity;
                amount: BigNumber;
            }[];
            dependencies: [(state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => import("../apis/balance/balance-types").GovVaultReward[] | undefined, (state: BeefyState, _vaultId: VaultEntity["id"], _walletAddress?: string) => {
                ethereum?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                polygon?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                bsc?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                optimism?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fantom?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                arbitrum?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                avax?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                cronos?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                moonbeam?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                moonriver?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                metis?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fuse?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                kava?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                canto?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                zksync?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                zkevm?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                base?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                gnosis?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                linea?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                mantle?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                fraxtal?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                mode?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                manta?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                real?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                sei?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                rootstock?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                scroll?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                lisk?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                sonic?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                aurora?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                emerald?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                berachain?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                celo?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                heco?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                harmony?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                saga?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                hyperevm?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                plasma?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                monad?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                megaeth?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
                } | undefined;
                robinhood?: {
                    byId: {
                        [id: string]: import("../entities/token").TokenEntity["address"];
                    };
                    byAddress: {
                        [address: string]: import("../entities/token").TokenEntity;
                    };
                    native: import("../entities/token").TokenNative["id"] | undefined;
                    wnative: import("../entities/token").TokenErc20["id"] | undefined;
                    interestingBalanceTokenAddresses: import("../entities/token").TokenEntity["address"][];
                    tokenIdsInActiveVaults: import("../entities/token").TokenEntity["id"][];
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
    }, (state: BeefyState, vaultId: VaultEntity["id"], _walletAddress?: string) => {
        index: number;
        token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
        price: BigNumber;
        apr: number;
    }[] | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectMerklUserRewardsStatus: ((state: BeefyState, walletAddress: string) => {
    canLoad: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    isError: boolean;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean) => {
        canLoad: boolean;
        isLoaded: boolean;
        isLoading: boolean;
        isError: boolean;
    };
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean) => {
        canLoad: boolean;
        isLoaded: boolean;
        isLoading: boolean;
        isError: boolean;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        canLoad: boolean;
        isLoaded: boolean;
        isLoading: boolean;
        isError: boolean;
    };
    dependencies: [import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").GlobalDataSelectorFn<boolean>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectStellaSwapUserRewardsStatus: ((state: BeefyState, walletAddress: string) => {
    canLoad: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    isError: boolean;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean) => {
        canLoad: boolean;
        isLoaded: boolean;
        isLoading: boolean;
        isError: boolean;
    };
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean) => {
        canLoad: boolean;
        isLoaded: boolean;
        isLoading: boolean;
        isError: boolean;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        canLoad: boolean;
        isLoaded: boolean;
        isLoading: boolean;
        isError: boolean;
    };
    dependencies: [import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").AddressDataSelectorFn<boolean>, import("./data-loader-helpers").GlobalDataSelectorFn<boolean>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
