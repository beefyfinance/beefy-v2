import type { TreasuryHoldingEntity } from '../../../../../data/entities/treasury';
type SortedAssetCategories = {
    staked: TreasuryHoldingEntity[];
    liquid: TreasuryHoldingEntity[];
    locked: TreasuryHoldingEntity[];
};
export declare const useSortedAssets: (assets: TreasuryHoldingEntity[]) => SortedAssetCategories;
export {};
