import type { BoostPromoEntity } from '../entities/promo';
import { type VaultEntity } from '../entities/vault';
import type { AvgApy, TotalApy } from '../reducers/apy-types';
import type { BeefyState } from '../store/types';
export declare const selectVaultTotalApyOrUndefined: (state: BeefyState, vaultId: VaultEntity["id"]) => Readonly<TotalApy> | undefined;
export declare const selectVaultTotalApy: (state: BeefyState, vaultId: VaultEntity["id"]) => Readonly<TotalApy>;
export declare const selectVaultAvgApyOrUndefined: (state: BeefyState, vaultId: VaultEntity["id"]) => Readonly<AvgApy> | undefined;
export declare const selectVaultAvgApy: (state: BeefyState, vaultId: VaultEntity["id"]) => Readonly<AvgApy>;
export declare const selectDidAPIReturnValuesForVault: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
/**
 * Ignores boost component of APY
 */
export declare const selectUserGlobalStats: (state: BeefyState, address?: string) => {
    deposited: number;
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    apy: number;
    depositedVaults: number;
};
export declare const selectYieldStatsByVaultId: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => {
    dailyUsd: BigNumber;
    dailyTokens: BigNumber;
    weeklyTokens: BigNumber;
    weeklyUsd: BigNumber;
    monthlyTokens: BigNumber;
    monthlyUsd: BigNumber;
    yearlyUsd: BigNumber;
    yearlyTokens: BigNumber;
    oraclePrice: BigNumber;
    depositToken: import("../entities/token").TokenEntity;
};
type ApyVaultUIData = {
    status: 'loading' | 'missing' | 'hidden';
    type: 'apy' | 'apr';
} | {
    status: 'available';
    type: 'apy' | 'apr';
    values: TotalApy;
    boosted: 'active' | 'prestake' | undefined;
    averages: AvgApy | undefined;
};
export declare const selectIsVaultApyAvailable: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare function selectApyVaultUIData(state: BeefyState, vaultId: VaultEntity['id']): ApyVaultUIData;
export declare const selectBoostAprByRewardToken: (state: BeefyState, boostId: BoostPromoEntity["id"]) => {
    rewardToken: string;
    apr: number;
}[];
export declare const selectBoostApr: (state: BeefyState, boostId: string) => number;
export {};
