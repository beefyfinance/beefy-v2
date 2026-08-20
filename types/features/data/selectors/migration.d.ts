import type { VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectMigratorById: (state: BeefyState, migratorId: string) => import("../reducers/wallet/migration-types").MigratorState;
export declare const selectMigrationIdsByVaultId: ((state: BeefyState, vaultId: string) => string[]) & {
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
    })) => string[];
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
    })) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => ({
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
export declare const selectMigrationVaultUserState: (state: BeefyState, migrationId: string, vaultId: VaultEntity["id"], walletAddress: string) => import("../reducers/wallet/migration-types").UserDataState<import("../apis/migration/migration-types").BaseUserData>;
export declare const selectMigrationVaultUserData: ((state: BeefyState, migrationId: string, vaultId: string, walletAddress: string) => import("../apis/migration/migration-types").BaseUserData | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../reducers/wallet/migration-types").UserDataState<import("../apis/migration/migration-types").BaseUserData>) => import("../apis/migration/migration-types").BaseUserData | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/migration-types").UserDataState<import("../apis/migration/migration-types").BaseUserData>) => import("../apis/migration/migration-types").BaseUserData | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/migration/migration-types").BaseUserData | undefined;
    dependencies: [(state: BeefyState, migrationId: string, vaultId: VaultEntity["id"], walletAddress: string) => import("../reducers/wallet/migration-types").UserDataState<import("../apis/migration/migration-types").BaseUserData>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
