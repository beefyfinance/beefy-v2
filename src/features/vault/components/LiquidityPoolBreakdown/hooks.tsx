import { useAppSelector } from '../../../../store';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useMemo } from 'react';
import { BIG_ONE, BIG_ZERO } from '../../../../helpers/big-number';
import { CalculatedBreakdownData } from './types';
import { TokenLpBreakdown } from '../../../data/entities/token';
import { VaultEntity } from '../../../data/entities/vault';
import { selectUserLpBreakdownBalance } from '../../../data/selectors/balance';

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

  const { assets, userShareOfPool, lpTotalSupplyDecimal, userBalanceDecimal, oneLpShareOfPool } =
    useAppSelector(state => selectUserLpBreakdownBalance(state, vault, breakdown));

  const totalValue = useMemo(() => {
    return assets.reduce((total, asset) => total.plus(asset.totalValue), BIG_ZERO);
  }, [assets]);

  const assetsWithTokens = useMemo(() => {
    return assets.map((asset, i) => ({
      ...asset,
      color: chartColors[i % assets.length],
      percent: totalValue.gt(BIG_ZERO) ? asset.totalValue.dividedBy(totalValue).toNumber() : 0,
    }));
  }, [assets, totalValue]);

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
  };
}
