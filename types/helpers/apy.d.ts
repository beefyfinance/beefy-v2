import { type VaultEntity } from '../features/data/entities/vault';
import type { AvgApy, TotalApyKey } from '../features/data/reducers/apy-types';
export declare const AVG_APY_PERIODS: [7, 30];
export declare const EMPTY_AVG_APY: AvgApy;
/**
 * Components are the individual parts that make up `totalApy` in `TotalApy`
 */
export declare const getApyComponents: (...props: never[]) => {
    readonly components: [...("vault" | "clm" | "rewardPool" | "merkl" | "trading" | "lending" | "composablePool" | "liquidStaking" | "rewardPoolTrading" | "lineaIgnition" | "stellaSwap")[], "boost", "merklBoost"];
    readonly daily: ("vaultDaily" | "tradingDaily" | "lendingDaily" | "composablePoolDaily" | "liquidStakingDaily" | "boostDaily" | "clmDaily" | "merklDaily" | "stellaSwapDaily" | "lineaIgnitionDaily" | "rewardPoolDaily" | "rewardPoolTradingDaily" | "merklBoostDaily")[];
    readonly yearly: ("vaultApr" | "rewardPoolApr" | "clmApr" | "merklApr" | "tradingApr" | "lendingApr" | "composablePoolApr" | "liquidStakingApr" | "rewardPoolTradingApr" | "lineaIgnitionApr" | "stellaSwapApr" | "boostApr" | "merklBoostApr")[];
};
export type ApyLabelsType = VaultEntity['type'] | 'cowcentrated-compounds';
export type ApyLabels = {
    [K in TotalApyKey | 'breakdown']: string[];
};
export declare const getApyLabelsForType: (type: ApyLabelsType) => ApyLabels;
/**
 * Components are the individual parts that make up `totalApy` in `ApiApyData`
 */
export declare const getApiApyDataComponents: (...props: never[]) => {
    readonly allComponents: ("vault" | "clm" | "rewardPool" | "merkl" | "trading" | "lending" | "composablePool" | "liquidStaking" | "rewardPoolTrading" | "lineaIgnition" | "stellaSwap")[];
    readonly allDaily: ("vaultDaily" | "tradingDaily" | "lendingDaily" | "composablePoolDaily" | "liquidStakingDaily" | "clmDaily" | "merklDaily" | "stellaSwapDaily" | "lineaIgnitionDaily" | "rewardPoolDaily" | "rewardPoolTradingDaily")[];
    readonly allYearly: ("vaultApr" | "rewardPoolApr" | "clmApr" | "merklApr" | "tradingApr" | "lendingApr" | "composablePoolApr" | "liquidStakingApr" | "rewardPoolTradingApr" | "lineaIgnitionApr" | "stellaSwapApr")[];
    readonly compoundableComponents: ["vault", "clm"];
    readonly compoundableDaily: ("vaultDaily" | "clmDaily")[];
    readonly compoundableYearly: ("vaultApr" | "clmApr")[];
    readonly nonCompoundableComponents: ["trading", "lending", "merkl", "stellaSwap", "lineaIgnition", "liquidStaking", "composablePool", "rewardPool", "rewardPoolTrading"];
    readonly nonCompoundableDaily: ("tradingDaily" | "lendingDaily" | "composablePoolDaily" | "liquidStakingDaily" | "merklDaily" | "stellaSwapDaily" | "lineaIgnitionDaily" | "rewardPoolDaily" | "rewardPoolTradingDaily")[];
    readonly nonCompoundableYearly: ("rewardPoolApr" | "merklApr" | "tradingApr" | "lendingApr" | "composablePoolApr" | "liquidStakingApr" | "rewardPoolTradingApr" | "lineaIgnitionApr" | "stellaSwapApr")[];
};
export declare function getApyLabelsTypeForVault(vault: VaultEntity, totalType: 'apy' | 'apr'): ApyLabelsType;
export declare function getApyLabelsForVault(vault: VaultEntity, totalType: 'apy' | 'apr'): ApyLabels;
