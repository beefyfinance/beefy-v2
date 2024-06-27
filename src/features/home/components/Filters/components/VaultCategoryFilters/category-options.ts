import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types';

export type VaultCategory = {
  i18nKey: string;
  highlight?: 'new' | undefined;
};

type VaultCategoryWithoutAll = Exclude<VaultCategoryType, 'all'>;

export const CATEGORY_OPTIONS: Record<VaultCategoryWithoutAll, VaultCategory> = {
  stable: { i18nKey: 'Filter-CategoryStable' },
  bluechip: { i18nKey: 'Filter-CategoryBlue' },
  correlated: { i18nKey: 'Filter-CategoryCorrelated' },
};
