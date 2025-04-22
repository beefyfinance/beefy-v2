import { sortBy } from 'lodash-es';
import type {
  MarketMakerHoldingEntity,
  TreasuryHoldingEntity,
} from '../../../../../data/entities/treasury.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import type BigNumber from 'bignumber.js';

type SortedAssetCategories = {
  staked: TreasuryHoldingEntity[];
  liquid: TreasuryHoldingEntity[];
  locked: TreasuryHoldingEntity[];
};

type SortedMMAssets = {
  [exchange: string]: MarketMakerHoldingEntity[];
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

export const useSortedMMHoldings = (exchanges: {
  [exchangeId: string]: {
    [address: string]: MarketMakerHoldingEntity;
  };
}): SortedMMAssets => {
  const exchangeBalances: Record<string, BigNumber> = {};
  for (const [exchangeId, exchangeHoldings] of Object.entries(exchanges)) {
    exchangeBalances[exchangeId] = BIG_ZERO;
    Object.values(exchangeHoldings).forEach(holding => {
      exchangeBalances[exchangeId] = exchangeBalances[exchangeId].plus(holding.usdValue);
    });
  }

  const sortedKeys = Object.keys(exchangeBalances).sort((a, b) =>
    exchangeBalances[b].minus(exchangeBalances[a]).toNumber()
  );
  const sortedMMHoldings: SortedMMAssets = {};
  sortedKeys.forEach(exchangeId => {
    sortedMMHoldings[exchangeId] = Object.values(exchanges[exchangeId])
      .filter(holding => holding.usdValue.gt(10))
      .sort((a, b) => b.usdValue.minus(a.usdValue).toNumber());
  });

  return sortedMMHoldings;
};
