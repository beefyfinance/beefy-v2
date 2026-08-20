import type { BeefyOffChainRewardsCampaignType } from '../apis/beefy/beefy-api-types';
import type { BoostRewardContractData } from '../apis/contract-data/contract-data-types';
import type { ChainEntity } from '../entities/chain';
import type { BoostPromoEntity, PromoEntity } from '../entities/promo';
import type { VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectBoostById: import("re-reselect").ParametricSelector<BeefyState, string, BoostPromoEntity> & {
    resultFunc: (res1: {
        [x: string]: PromoEntity | undefined;
    }, res2: string) => BoostPromoEntity;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: PromoEntity | undefined;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BoostPromoEntity, (res1: {
        [x: string]: PromoEntity | undefined;
    }, res2: string) => BoostPromoEntity, [import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: PromoEntity | undefined;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectBoostByIdOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], boostId: string) => BoostPromoEntity | undefined;
export declare const selectBoostByContractAddressOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], contractAddress: string) => BoostPromoEntity | undefined;
export declare const selectCurrentBoostByVaultIdOrUndefined: import("re-reselect").ParametricSelector<BeefyState, string, BoostPromoEntity | undefined> & {
    resultFunc: (res1: string | undefined, res2: {
        [x: string]: PromoEntity | undefined;
    }) => BoostPromoEntity | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: PromoEntity | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BoostPromoEntity | undefined, (res1: string | undefined, res2: {
        [x: string]: PromoEntity | undefined;
    }) => BoostPromoEntity | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, string | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: PromoEntity | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectBoostsByChainId: (state: BeefyState, chainId: ChainEntity["id"]) => string[];
export declare const selectIsVaultBoosted: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: string[]) => boolean;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: string[]) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, string[]>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultPreStakedOrBoosted: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res1: string[], res2: string[]) => boolean;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, string[]>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res1: string[], res2: string[]) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, string[]>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultCurrentBoostId: import("re-reselect").ParametricSelector<BeefyState, string, string | undefined> & {
    resultFunc: (res1: string[], res2: string[]) => string | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, string[]>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string | undefined, (res1: string[], res2: string[]) => string | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, string[]>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultCurrentBoostIdWithStatus: import("re-reselect").ParametricSelector<BeefyState, string, {
    id: string;
    status: "active" | "prestake";
} | undefined> & {
    resultFunc: (res1: string[], res2: string[]) => {
        id: string;
        status: "active" | "prestake";
    } | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, string[]>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, {
        id: string;
        status: "active" | "prestake";
    } | undefined, (res1: string[], res2: string[]) => {
        id: string;
        status: "active" | "prestake";
    } | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, string[]>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultPrestakedBoost: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: string[]) => boolean;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: string[]) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, string[]>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectActiveVaultBoostIds: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectPreStakeVaultBoostIds: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectPreStakeOrActiveBoostIds: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectAllVaultBoostIds: (state: BeefyState, vaultId: VaultEntity["id"]) => string[];
export declare const selectPastVaultBoostIds: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: string[] | undefined, res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultsActiveBoostPeriodFinish: (state: BeefyState, vaultId: BoostPromoEntity["id"]) => Date;
export declare const selectBoostPeriodFinish: (state: BeefyState, boostId: BoostPromoEntity["id"]) => Date | null;
export declare const selectBoostContractState: (state: BeefyState, boostId: BoostPromoEntity["id"]) => import("../apis/contract-data/contract-data-types").BoostContractData;
export declare const selectBoostPartnerById: (state: BeefyState, partnerId: string) => import("../entities/promo").PromoPartnerEntity;
export declare const selectBoostCampaignById: (state: BeefyState, campaignId: string) => import("../entities/promo").PromoCampaignEntity;
export declare const selectOffchainBoostCampaignByType: (state: BeefyState, type: BeefyOffChainRewardsCampaignType | undefined) => import("../entities/promo").PromoCampaignEntity | undefined;
export declare const selectBoostRewards: import("re-reselect").ParametricSelector<BeefyState, string, BoostRewardContractData[]> & {
    resultFunc: (res: import("../apis/contract-data/contract-data-types").BoostContractData) => BoostRewardContractData[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/contract-data/contract-data-types").BoostContractData>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BoostRewardContractData[], (res: import("../apis/contract-data/contract-data-types").BoostContractData) => BoostRewardContractData[], [import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/contract-data/contract-data-types").BoostContractData>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectBoostActiveRewards: import("re-reselect").ParametricSelector<BeefyState, string, BoostRewardContractData[]> & {
    resultFunc: (res1: BoostRewardContractData[], res2: number) => BoostRewardContractData[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BoostRewardContractData[]>, import("re-reselect").ParametricSelector<BeefyState, string, number>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BoostRewardContractData[], (res1: BoostRewardContractData[], res2: number) => BoostRewardContractData[], [import("re-reselect").ParametricSelector<BeefyState, string, BoostRewardContractData[]>, import("re-reselect").ParametricSelector<BeefyState, string, number>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectBoostActiveRewardTokens: import("re-reselect").ParametricSelector<BeefyState, string, (import("../entities/token").TokenErc20 | import("../entities/token").TokenNative)[]> & {
    resultFunc: (res1: BoostRewardContractData[], res2: {
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
    }) => (import("../entities/token").TokenErc20 | import("../entities/token").TokenNative)[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BoostRewardContractData[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
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
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, (import("../entities/token").TokenErc20 | import("../entities/token").TokenNative)[], (res1: BoostRewardContractData[], res2: {
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
    }) => (import("../entities/token").TokenErc20 | import("../entities/token").TokenNative)[], [import("re-reselect").ParametricSelector<BeefyState, string, BoostRewardContractData[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
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
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
