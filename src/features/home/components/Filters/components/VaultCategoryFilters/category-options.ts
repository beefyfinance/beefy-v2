import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';

export type VaultCategory = {
  i18nKey: string;
  highlight?: 'new' | undefined;
};

export const CATEGORY_OPTIONS: Record<FilteredVaultsState['vaultCategory'], VaultCategory> = {
  all: { i18nKey: 'Filter-CategoryAll' },
  featured: { i18nKey: 'Filter-CategoryFeatured' },
  stable: { i18nKey: 'Filter-CategoryStable' },
  bluechip: { i18nKey: 'Filter-CategoryBlue' },
  correlated: { i18nKey: 'Filter-CategoryCorrelated' },
  clm: { i18nKey: 'Filter-CategoryCLM', highlight: 'new' },
};
