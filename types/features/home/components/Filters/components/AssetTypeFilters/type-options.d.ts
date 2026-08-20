import type { VaultAssetType } from '../../../../../data/reducers/filtered-vaults-types';
export type AssetCategory = {
    i18nKey: string;
    highlight?: 'new' | undefined;
};
export declare const TYPE_OPTIONS: Record<VaultAssetType, AssetCategory>;
