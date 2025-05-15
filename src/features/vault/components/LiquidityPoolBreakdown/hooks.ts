import { useMemo } from 'react';
import { BIG_ONE, BIG_ZERO } from '../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { TokenLpBreakdown } from '../../../data/entities/token.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectUserLpBreakdownBalance } from '../../../data/selectors/balance.ts';
import { selectTokenByAddress } from '../../../data/selectors/tokens.ts';
import type { CalculatedBreakdownData } from './types.ts';

export const chartColors = [
  '#D9E7F2',
  '#ABCBE3',
  '#7DAFD3',
  '#4F93C4',
  '#3674A0',
  '#1d4159',
  '#152e3f',
];

export function useCalculatedBreakdown(
  vault: VaultEntity,
  breakdown: TokenLpBreakdown
): CalculatedBreakdownData {
  const lpToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );

  const {
    assets,
    userShareOfPool,
    lpTotalSupplyDecimal,
    userBalanceDecimal,
    oneLpShareOfPool,
    underlyingShareOfPool,
    underlyingTotalSupplyDecimal,
  } = useAppSelector(state => selectUserLpBreakdownBalance(state, vault, breakdown));

  const { totalValue, totalUnderlyingValue } = useMemo(() => {
    return assets.reduce(
      (total, asset) => {
        total.totalValue = total.totalValue.plus(asset.totalValue);
        total.totalUnderlyingValue = total.totalUnderlyingValue.plus(asset.totalUnderlyingValue);
        return total; // Add this line to return the updated total object
      },
      { totalValue: BIG_ZERO, totalUnderlyingValue: BIG_ZERO }
    );
  }, [assets]);

  const assetsWithTokens = useMemo(() => {
    return assets.map((asset, i) => ({
      ...asset,
      color: chartColors[i % assets.length],
      percent: totalValue.gt(BIG_ZERO) ? asset.totalValue.dividedBy(totalValue).toNumber() : 0,
      underlyingPercent:
        totalUnderlyingValue.gt(BIG_ZERO) ?
          asset.totalUnderlyingValue.dividedBy(totalUnderlyingValue).toNumber()
        : 0,
    }));
  }, [assets, totalUnderlyingValue, totalValue]);

  return {
    chainId: vault.chainId,
    assets: assetsWithTokens,
    token: lpToken,
    totalAmount: lpTotalSupplyDecimal,
    oneAmount: BIG_ONE,
    userAmount: userShareOfPool.multipliedBy(lpTotalSupplyDecimal),
    totalValue,
    oneValue: oneLpShareOfPool.multipliedBy(totalValue),
    userValue: userShareOfPool.multipliedBy(totalValue),
    userBalance: userBalanceDecimal,
    underlyingBalance: underlyingShareOfPool,
    underlyingAmount: underlyingTotalSupplyDecimal,
    underlyingValue: totalUnderlyingValue,
  };
}
