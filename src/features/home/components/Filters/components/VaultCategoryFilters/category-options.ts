import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';

export type VaultCategory = {
  i18nKey: string;
  highlight?: 'new' | undefined;
};

type VaultCategoryWithoutAll = Exclude<VaultCategoryType, 'all'>;

export const CATEGORY_OPTIONS = {
  stable: { i18nKey: 'Filter-CategoryStable' },
  bluechip: { i18nKey: 'Filter-CategoryBlue' },
  meme: { i18nKey: 'Filter-CategoryMeme' },
  correlated: { i18nKey: 'Filter-CategoryCorrelated' },
} as const satisfies Record<VaultCategoryWithoutAll, VaultCategory>;
