import { sortBy } from 'lodash-es';
import type { TreasuryHoldingEntity } from '../../../../../data/entities/treasury';

type SortedAssetCategories = {
  stakedAssets: TreasuryHoldingEntity[];
  liquidAssets: TreasuryHoldingEntity[];
  lockedAssets: TreasuryHoldingEntity[];
};

export const useSortedAssets = (assets: TreasuryHoldingEntity[]): SortedAssetCategories => {
  const sortedAssets = sortBy(assets, token => {
    const balanceToken = token.usdValue;
    return -1 * balanceToken.toNumber();
  });

  const list: SortedAssetCategories = {
    stakedAssets: [],
    liquidAssets: [],
    lockedAssets: [],
  };

  for (const token of sortedAssets) {
    //HIDE: All tokens with less than 10 usd
    if (token.usdValue.gt(10)) {
      if ((token.assetType === 'token' || token.assetType === 'native') && !token.staked) {
        list.liquidAssets.push(token);
      }
      if (token.staked) {
        list.stakedAssets.push(token);
      }
      if (token.assetType === 'validator') {
        list.lockedAssets.push(token);
      }
    }
  }

  return list;
};
