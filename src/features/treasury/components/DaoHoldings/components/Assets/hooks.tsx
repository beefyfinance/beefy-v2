import { sortBy } from 'lodash';
import { TreasuryHoldingEntity } from '../../../../../data/entities/treasury';

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
    if (token.assetType === 'token' || token.assetType === 'native') {
      list.liquidAssets.push(token);
    }
    if (token.assetType === 'vault') {
      list.stakedAssets.push(token);
    }
    if (token.assetType === 'validator') {
      list.lockedAssets.push(token);
    }
  }

  return list;
};
