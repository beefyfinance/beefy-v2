import type { VaultEntity } from '../entities/vault';
export type RiskKeys = Exclude<keyof VaultEntity['risks'], 'updatedAt'>;
export type RiskChange = {
    key: RiskKeys;
    value: boolean;
};
export declare const platformRiskMap: Record<string, RiskChange>;
export declare const tokenTagToRiskMap: Record<string, RiskChange>;
export declare const selectVaultRiskChecklist: ((state: import("../store/types").BeefyState, vaultId: string) => {
    updatedAt: number;
    passed: string[];
    failed: string[];
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../entities/vault").VaultRisks) => {
        updatedAt: number;
        passed: string[];
        failed: string[];
    };
    memoizedResultFunc: ((resultFuncArgs_0: import("../entities/vault").VaultRisks) => {
        updatedAt: number;
        passed: string[];
        failed: string[];
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        updatedAt: number;
        passed: string[];
        failed: string[];
    };
    dependencies: [((state: import("../store/types").BeefyState, vaultId: string) => import("../entities/vault").VaultRisks) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: ({
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
        }), resultFuncArgs_1: import("../entities/platform").PlatformEntity | undefined, resultFuncArgs_2: import("../entities/token").TokenEntity[] | undefined) => import("../entities/vault").VaultRisks;
        memoizedResultFunc: ((resultFuncArgs_0: ({
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
        }), resultFuncArgs_1: import("../entities/platform").PlatformEntity | undefined, resultFuncArgs_2: import("../entities/token").TokenEntity[] | undefined) => import("../entities/vault").VaultRisks) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("../entities/vault").VaultRisks;
        dependencies: [(state: import("../store/types").BeefyState, vaultId: VaultEntity["id"]) => ({
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
        }), import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, import("../entities/platform").PlatformEntity | undefined> & {
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
            }), res2: {
                [x: string]: import("../entities/platform").PlatformEntity | undefined;
            }) => import("../entities/platform").PlatformEntity | undefined;
            dependencies: [import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, ({
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
            })>, import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, {
                [x: string]: import("../entities/platform").PlatformEntity | undefined;
            }>];
            recomputations: () => number;
            resetRecomputations: () => number;
        } & {
            getMatchingSelector: (state: import("../store/types").BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<import("../store/types").BeefyState, string, import("../entities/platform").PlatformEntity | undefined, (res1: ({
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
            }), res2: {
                [x: string]: import("../entities/platform").PlatformEntity | undefined;
            }) => import("../entities/platform").PlatformEntity | undefined, [import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, ({
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
            })>, import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, {
                [x: string]: import("../entities/platform").PlatformEntity | undefined;
            }>]>;
            removeMatchingSelector: (state: import("../store/types").BeefyState, props: string, ...args: any[]) => void;
            clearCache: () => void;
            cache: import("re-reselect").ICacheObject;
            keySelector: import("re-reselect").ParametricKeySelector<import("../store/types").BeefyState, string>;
        }, import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, import("../entities/token").TokenEntity[] | undefined> & {
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
            }), res2: {
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
            }) => import("../entities/token").TokenEntity[] | undefined;
            dependencies: [import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, ({
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
            })>, import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, {
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
            getMatchingSelector: (state: import("../store/types").BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<import("../store/types").BeefyState, string, import("../entities/token").TokenEntity[] | undefined, (res1: ({
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
            }), res2: {
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
            }) => import("../entities/token").TokenEntity[] | undefined, [import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, ({
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
            })>, import("re-reselect").ParametricSelector<import("../store/types").BeefyState, string, {
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
            removeMatchingSelector: (state: import("../store/types").BeefyState, props: string, ...args: any[]) => void;
            clearCache: () => void;
            cache: import("re-reselect").ICacheObject;
            keySelector: import("re-reselect").ParametricKeySelector<import("../store/types").BeefyState, string>;
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
