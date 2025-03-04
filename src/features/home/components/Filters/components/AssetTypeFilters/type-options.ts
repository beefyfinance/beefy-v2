import type { VaultAssetType } from '../../../../../data/reducers/filtered-vaults-types.ts';

export type AssetCategory = {
  i18nKey: string;
  highlight?: 'new' | undefined;
};

export const TYPE_OPTIONS: Record<VaultAssetType, AssetCategory> = {
  single: { i18nKey: 'Filter-AsstSingle' },
  lps: { i18nKey: 'Filter-LP' },
  clm: { i18nKey: 'Filter-CLM' },
};
