import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { type VaultCowcentrated, type VaultCowcentratedLike, type VaultEntity, type VaultGov, type VaultGovCowcentrated, type VaultStandard, type VaultStandardCowcentrated } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectAllVaultIdsIncludingHidden: (state: BeefyState) => string[];
export declare const selectAllVisibleVaultIds: (state: BeefyState) => string[];
export declare const selectAllCowcentratedVaultIds: (state: BeefyState) => string[];
export declare const selectVaultByIdOrUndefined: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultEntity | undefined;
export declare const selectVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => ({
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
});
export declare const selectVaultByIdWithReceiptOrUndefined: (state: BeefyState, vaultId: VaultEntity["id"]) => import("../entities/vault").VaultWithReceipt | undefined;
export declare const selectVaultByIdWithReceipt: (state: BeefyState, vaultId: VaultEntity["id"]) => ({
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
});
export declare const selectVaultByAddressOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], vaultAddress: VaultEntity["contractAddress"]) => VaultEntity | undefined;
export declare const selectVaultByAddress: (state: BeefyState, chainId: ChainEntity["id"], vaultAddress: VaultEntity["contractAddress"]) => VaultEntity;
/** The id of the vault whose contract address is equal to the deposit token address of the passed vault id */
export declare const selectVaultUnderlyingVaultIdOrUndefined: (state: BeefyState, parentVaultId: VaultEntity["id"]) => VaultEntity["id"] | undefined;
/** The vault whose contract address is equal to the deposit token address of the passed vault id */
export declare const selectVaultUnderlyingVaultOrUndefined: (state: BeefyState, parentVaultId: VaultEntity["id"]) => VaultEntity | undefined;
/** The vault whose contract address is equal to the deposit token address of the passed vault id */
export declare const selectVaultUnderlyingVault: (state: BeefyState, parentVaultId: VaultEntity["id"]) => VaultEntity;
export type VaultReplacementMigration = {
    /** the wrapper vault the user holds / migrates from */
    oldVaultId: VaultEntity['id'];
    /** the wrapper vault to migrate into */
    newVaultId: VaultEntity['id'];
};
/**
 * Resolve the old/new vault pair for the replacement-vault migration card, given the OLD page
 * vault. The card only shows on the OLD vault page, so this only resolves when the page vault is
 * the source (old) side.
 *
 * Two cases:
 * - CLM wrappers: `replacementVaultId` is set on the naked CLM, but users hold a wrapper (gov "-rp"
 *   pool or standard "-vault"). So we map the page wrapper -> its CLM -> the replacement CLM -> the
 *   wrapper of the SAME kind (pool->pool, vault->vault).
 * - Common vaults (standard / gov / erc4626): users hold the vault directly, so `replacementVaultId`
 *   is set on the vault itself and points straight at the new vault.
 *
 * Returns undefined if the page vault declares no (resolvable) replacement, e.g. a CLM wrapper whose
 * matching wrapper on the new side does not exist, or either a CLM wrapper or a (common) vault whose
 * replacement target is unknown, self-referential, or paused/retired. The old vault's own status is
 * not gated: an active vault may steer holders to its replacement.
 */
export declare const selectVaultReplacementMigration: import("re-reselect").ParametricSelector<BeefyState, string, VaultReplacementMigration | undefined> & {
    resultFunc: (res1: string, res2: {
        [x: string]: VaultEntity | undefined;
    }) => VaultReplacementMigration | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: VaultEntity | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, VaultReplacementMigration | undefined, (res1: string, res2: {
        [x: string]: VaultEntity | undefined;
    }) => VaultReplacementMigration | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, string>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: VaultEntity | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultPausedOrRetired: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: ({
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
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
    })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultPaused: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: ({
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
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
    })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultRetired: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: ({
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
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
    })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultCowcentrated: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: ({
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
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
    })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectIsVaultGov: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: ({
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
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
    })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultType: import("re-reselect").ParametricSelector<BeefyState, string, "cowcentrated" | "standard" | "gov" | "erc4626"> & {
    resultFunc: (res: ({
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
    })) => "cowcentrated" | "standard" | "gov" | "erc4626";
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, "cowcentrated" | "standard" | "gov" | "erc4626", (res: ({
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
    })) => "cowcentrated" | "standard" | "gov" | "erc4626", [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectCowcentratedVaultDepositTokenAddresses: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res: VaultCowcentrated) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, VaultCowcentrated>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res: VaultCowcentrated) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, VaultCowcentrated>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultExistsById: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectVaultByIdCaseInsensitiveOrUndefined: ((state: BeefyState, vaultId: string) => VaultEntity | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: string[], resultFuncArgs_2: {
        [x: string]: VaultEntity | undefined;
    }) => VaultEntity | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: string[], resultFuncArgs_2: {
        [x: string]: VaultEntity | undefined;
    }) => VaultEntity | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => VaultEntity | undefined;
    dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => string[], (state: BeefyState) => {
        [x: string]: VaultEntity | undefined;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectGovVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultGov;
export declare const selectCowcentratedVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultCowcentrated;
export declare const selectCowcentratedLikeVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultCowcentratedLike;
export declare const selectCowcentratedOrCowcentratedPoolVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultCowcentrated | VaultGovCowcentrated;
export declare const selectStandardCowcentratedVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultStandardCowcentrated;
export declare const selectGovCowcentratedVaultById: (state: BeefyState, vaultId: VaultEntity["id"]) => VaultGovCowcentrated;
export declare const selectStandardVaultById: import("re-reselect").ParametricSelector<BeefyState, string, VaultStandard> & {
    resultFunc: (res: ({
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
    })) => VaultStandard;
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, VaultStandard, (res: ({
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
    })) => VaultStandard, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectStandardOrCowcentratedVaultById: import("re-reselect").ParametricSelector<BeefyState, string, VaultStandard | VaultCowcentrated> & {
    resultFunc: (res: ({
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
    })) => VaultStandard | VaultCowcentrated;
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, VaultStandard | VaultCowcentrated, (res: ({
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
    })) => VaultStandard | VaultCowcentrated, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectErc4626VaultById: import("re-reselect").ParametricSelector<BeefyState, string, import("../entities/vault").VaultErc4626AsyncWithdraw> & {
    resultFunc: (res: ({
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
    })) => import("../entities/vault").VaultErc4626AsyncWithdraw;
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, import("../entities/vault").VaultErc4626AsyncWithdraw, (res: ({
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
    })) => import("../entities/vault").VaultErc4626AsyncWithdraw, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultIdsByChainIdIncludingHidden: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => string[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        allIds: VaultEntity["id"][];
        byAddress: {
            [address: string]: VaultEntity["id"];
        };
        byType: { [type in VaultEntity["type"]]: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byDepositTokenAddress: {
                [address: string]: VaultEntity["id"][];
            };
        }; };
    } | undefined) => string[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        allIds: VaultEntity["id"][];
        byAddress: {
            [address: string]: VaultEntity["id"];
        };
        byType: { [type in VaultEntity["type"]]: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byDepositTokenAddress: {
                [address: string]: VaultEntity["id"][];
            };
        }; };
    } | undefined) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"]) => {
        allIds: VaultEntity["id"][];
        byAddress: {
            [address: string]: VaultEntity["id"];
        };
        byType: { [type in VaultEntity["type"]]: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byDepositTokenAddress: {
                [address: string]: VaultEntity["id"][];
            };
        }; };
    } | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultPricePerFullShare: ((state: BeefyState, vaultId: string) => BigNumber) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: BigNumber | null | undefined) => BigNumber;
    memoizedResultFunc: ((resultFuncArgs_0: BigNumber | null | undefined) => BigNumber) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => BigNumber;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber | null | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultStrategyAddress: (state: BeefyState, vaultId: VaultEntity["id"]) => string;
export declare const selectVaultStrategyAddressOrUndefined: (state: BeefyState, vaultId: VaultEntity["id"]) => string | undefined;
export declare const selectAllGovVaultsByChainId: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => VaultGov[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => VaultGov[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => VaultGov[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => VaultGov[];
    dependencies: [(state: BeefyState) => {
        [x: string]: VaultEntity | undefined;
    }, (state: BeefyState, chainId: ChainEntity["id"]) => string[] | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllStandardVaultsByChainId: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => VaultStandard[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => VaultStandard[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => VaultStandard[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => VaultStandard[];
    dependencies: [(state: BeefyState) => {
        [x: string]: VaultEntity | undefined;
    }, (state: BeefyState, chainId: ChainEntity["id"]) => string[] | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllCowcentratedVaultsByChainId: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => VaultCowcentrated[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => VaultCowcentrated[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => VaultCowcentrated[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => VaultCowcentrated[];
    dependencies: [(state: BeefyState) => {
        [x: string]: VaultEntity | undefined;
    }, (state: BeefyState, chainId: ChainEntity["id"]) => string[] | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllErc4626VaultsByChainId: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => import("../entities/vault").VaultErc4626AsyncWithdraw[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => import("../entities/vault").VaultErc4626AsyncWithdraw[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        [x: string]: VaultEntity | undefined;
    }, resultFuncArgs_1: string[] | undefined) => import("../entities/vault").VaultErc4626AsyncWithdraw[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../entities/vault").VaultErc4626AsyncWithdraw[];
    dependencies: [(state: BeefyState) => {
        [x: string]: VaultEntity | undefined;
    }, (state: BeefyState, chainId: ChainEntity["id"]) => string[] | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectNonGovVaultIdsByDepositTokenAddress: import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string[]> & {
    resultFunc: (res1: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", res2: string, res3: {
        ethereum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        polygon?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        bsc?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        optimism?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fantom?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        arbitrum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        avax?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        cronos?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonbeam?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonriver?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        metis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fuse?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        kava?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        canto?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zksync?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zkevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        base?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        gnosis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        linea?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mantle?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fraxtal?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mode?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        manta?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        real?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sei?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        rootstock?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        scroll?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        lisk?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sonic?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        aurora?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        emerald?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        berachain?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        celo?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        heco?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        harmony?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        saga?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        hyperevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        plasma?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        monad?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        megaeth?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        robinhood?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
    }) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood">, import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string>, import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", {
        ethereum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        polygon?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        bsc?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        optimism?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fantom?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        arbitrum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        avax?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        cronos?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonbeam?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonriver?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        metis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fuse?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        kava?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        canto?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zksync?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zkevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        base?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        gnosis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        linea?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mantle?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fraxtal?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mode?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        manta?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        real?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sei?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        rootstock?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        scroll?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        lisk?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sonic?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        aurora?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        emerald?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        berachain?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        celo?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        heco?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        harmony?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        saga?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        hyperevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        plasma?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        monad?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        megaeth?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        robinhood?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string[], (res1: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", res2: string, res3: {
        ethereum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        polygon?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        bsc?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        optimism?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fantom?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        arbitrum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        avax?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        cronos?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonbeam?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonriver?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        metis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fuse?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        kava?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        canto?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zksync?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zkevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        base?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        gnosis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        linea?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mantle?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fraxtal?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mode?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        manta?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        real?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sei?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        rootstock?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        scroll?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        lisk?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sonic?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        aurora?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        emerald?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        berachain?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        celo?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        heco?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        harmony?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        saga?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        hyperevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        plasma?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        monad?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        megaeth?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        robinhood?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood">, import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string>, import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", {
        ethereum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        polygon?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        bsc?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        optimism?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fantom?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        arbitrum?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        avax?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        cronos?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonbeam?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        moonriver?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        metis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fuse?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        kava?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        canto?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zksync?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        zkevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        base?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        gnosis?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        linea?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mantle?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        fraxtal?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        mode?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        manta?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        real?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sei?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        rootstock?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        scroll?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        lisk?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        sonic?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        aurora?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        emerald?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        berachain?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        celo?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        heco?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        harmony?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        saga?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        hyperevm?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        plasma?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        monad?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        megaeth?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
        robinhood?: {
            allIds: VaultEntity["id"][];
            byAddress: {
                [address: string]: VaultEntity["id"];
            };
            byType: { [type in VaultEntity["type"]]: {
                allIds: VaultEntity["id"][];
                byAddress: {
                    [address: string]: VaultEntity["id"];
                };
                byDepositTokenAddress: {
                    [address: string]: VaultEntity["id"][];
                };
            }; };
        } | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood">;
};
export declare const selectFirstNonGovVaultByDepositTokenAddress: import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", VaultEntity | undefined> & {
    resultFunc: (res1: string[], res2: {
        [x: string]: VaultEntity | undefined;
    }) => VaultEntity | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string[]>, import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", {
        [x: string]: VaultEntity | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", VaultEntity | undefined, (res1: string[], res2: {
        [x: string]: VaultEntity | undefined;
    }) => VaultEntity | undefined, [import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string[]>, import("re-reselect").ParametricSelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", {
        [x: string]: VaultEntity | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood">;
};
export declare const selectGovVaultVaultIdsByDepositTokenAddress: (state: BeefyState, chainId: ChainEntity["id"], tokenAddress: TokenEntity["address"]) => string[];
export declare const selectIsStandardVaultEarnTokenAddress: (state: BeefyState, chainId: ChainEntity["id"], tokenAddress: TokenEntity["address"]) => boolean;
export declare const selectStandardVaultByAddressOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], contractAddress: VaultStandard["contractAddress"]) => VaultStandard | undefined;
export declare const selectVaultWithReceiptByAddressOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], contractAddress: VaultStandard["contractAddress"]) => import("../entities/vault").VaultWithReceipt | undefined;
export declare const selectAllActiveVaultIds: (state: BeefyState) => string[];
export declare const selectTotalActiveVaults: (state: BeefyState) => number;
export declare const selectVaultDepositFee: (state: BeefyState, vaultId: VaultEntity["id"]) => number;
export declare const selectVaultLastHarvestByVaultId: import("re-reselect").ParametricSelector<BeefyState, string, number> & {
    resultFunc: (res1: {
        [vaultId: string]: number;
    }, res2: string) => number;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, {
        [vaultId: string]: number;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, number, (res1: {
        [vaultId: string]: number;
    }, res2: string) => number, [import("re-reselect").ParametricSelector<BeefyState, string, {
        [vaultId: string]: number;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectAllVaultIdsWithBridgedVersion: (state: BeefyState) => string[];
export declare const selectAllVaultsWithBridgedVersion: (state: BeefyState) => (({
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
}))[];
export declare const selectAllCowcentratedVaults: ((state: BeefyState) => VaultCowcentrated[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: {
        [x: string]: VaultEntity | undefined;
    }) => VaultCowcentrated[];
    memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: {
        [x: string]: VaultEntity | undefined;
    }) => VaultCowcentrated[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => VaultCowcentrated[];
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
};
export declare const selectVaultsPinnedConfigs: (state: BeefyState) => import("../apis/promos/types").PinnedConfig[];
export declare const selectVaultIsPinned: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectVaultIdForVaultPage: ((state: BeefyState, vaultId: string | undefined) => string) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string | undefined, resultFuncArgs_1: boolean, resultFuncArgs_2: VaultEntity | undefined) => string;
    memoizedResultFunc: ((resultFuncArgs_0: string | undefined, resultFuncArgs_1: boolean, resultFuncArgs_2: VaultEntity | undefined) => string) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string;
    dependencies: [(_state: BeefyState, vaultId: string | undefined) => string | undefined, (state: BeefyState, _vaultId: string | undefined) => boolean, (state: BeefyState, vaultId: string | undefined) => VaultEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
/** Returns false if vault is retired or paused and not earning */
export declare const selectVaultShouldShowInterest: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res: ({
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
    })>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
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
    })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
