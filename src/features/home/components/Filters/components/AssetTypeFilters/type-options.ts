import type { VaultAssetType } from '../../../../../data/reducers/filtered-vaults-types';

export type AssetCategory = {
  i18nKey: string;
  highlight?: 'new' | undefined;
};

type VaultAssetTypeWithouAll = Exclude<VaultAssetType, 'all'>;

export const TYPE_OPTIONS: Record<VaultAssetTypeWithouAll, AssetCategory> = {
  single: { i18nKey: 'Filter-AsstSingle' },
  lps: { i18nKey: 'Filter-LP' },
  clm: { i18nKey: 'Filter-CLM' },
};
