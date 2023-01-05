import { sortBy } from 'lodash';
import { TreasuryHoldingsEntity } from '../../../../../data/entities/treasury';

export const useSortedAssets = (
  assets: TreasuryHoldingsEntity[],
  sortDirection: 'desc' | 'asc' = 'asc'
) => {
  const sortDirMul = sortDirection === 'desc' ? 1 : -1;
  const sortedAssets = sortBy(assets, token => {
    const balanceToken = token.usdValue;
    return sortDirMul * balanceToken.toNumber();
  });

  const list = {
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
