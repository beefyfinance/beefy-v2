import { sortBy } from 'lodash-es';
import type { TreasuryHoldingEntity } from '../../../../../data/entities/treasury.ts';
import {
  getTreasuryHoldingCategory,
  TREASURY_MIN_DISPLAY_USD,
} from '../../../../../data/entities/treasury.ts';

type SortedAssetCategories = {
  staked: TreasuryHoldingEntity[];
  liquid: TreasuryHoldingEntity[];
  locked: TreasuryHoldingEntity[];
};

export const useSortedAssets = (assets: TreasuryHoldingEntity[]): SortedAssetCategories => {
  const sortedAssets = sortBy(assets, token => {
    const balanceToken = token.usdValue;
    return -1 * balanceToken.toNumber();
  });

  const list: SortedAssetCategories = {
    staked: [],
    liquid: [],
    locked: [],
  };

  for (const token of sortedAssets) {
    //HIDE: All tokens with less than 10 usd
    if (token.usdValue.gte(TREASURY_MIN_DISPLAY_USD)) {
      const category = getTreasuryHoldingCategory(token);
      if (category) {
        list[category].push(token);
      }
    }
  }

  return list;
};
