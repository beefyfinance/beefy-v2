import { sortBy } from 'lodash-es';
import type { TreasuryHoldingEntity } from '../../../../../data/entities/treasury.ts';

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
    if (token.usdValue.gt(10)) {
      if ((token.assetType === 'token' || token.assetType === 'native') && !token.staked) {
        list.liquid.push(token);
      }
      if (token.staked) {
        list.staked.push(token);
      }
      if (token.assetType === 'validator') {
        list.locked.push(token);
      }
    }
  }

  return list;
};
