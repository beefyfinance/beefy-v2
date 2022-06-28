import { useAppSelector } from '../../../../store';
import { selectTokenByAddress, selectTokenPriceByAddress } from '../../../data/selectors/tokens';
import { useMemo } from 'react';
import { BIG_ONE, BIG_ZERO } from '../../../../helpers/big-number';
import { CalculatedBreakdownData } from './types';
import { TokenLpBreakdown } from '../../../data/entities/token';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import {
  selectGovVaultUserStackedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
} from '../../../data/selectors/balance';
import { BigNumber } from 'bignumber.js';

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

  const lpTotalSupplyDecimal = new BigNumber(breakdown.totalSupply);
  const userBalanceDecimal = useAppSelector(state =>
    isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id)
  );
  const userShareOfPool = lpTotalSupplyDecimal.gt(BIG_ZERO)
    ? userBalanceDecimal.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;
  const oneLpShareOfPool = lpTotalSupplyDecimal.gt(BIG_ZERO)
    ? BIG_ONE.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;

  const assetsTemp = useAppSelector(state =>
    breakdown.tokens.map((tokenAddress, i) => {
      const reserves = new BigNumber(breakdown.balances[i]);
      const assetToken = selectTokenByAddress(state, vault.chainId, tokenAddress);
      const valuePerDecimal = selectTokenPriceByAddress(state, vault.chainId, tokenAddress);
      const totalValue = reserves.multipliedBy(valuePerDecimal);

      return {
        ...assetToken,
        totalAmount: reserves,
        userAmount: userShareOfPool.multipliedBy(reserves),
        oneAmount: oneLpShareOfPool.multipliedBy(reserves),
        totalValue,
        userValue: userShareOfPool.multipliedBy(totalValue),
        oneValue: oneLpShareOfPool.multipliedBy(totalValue),
        price: valuePerDecimal,
        color: chartColors[i % chartColors.length],
      };
    })
  );

  const totalValue = useMemo(() => {
    return assetsTemp.reduce((total, asset) => total.plus(asset.totalValue), BIG_ZERO);
  }, [assetsTemp]);

  const assetsWithTokens = useMemo(() => {
    return assetsTemp.map(asset => ({
      ...asset,
      percent: totalValue.gt(BIG_ZERO) ? asset.totalValue.dividedBy(totalValue).toNumber() : 0,
    }));
  }, [assetsTemp, totalValue]);

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
