import { useAppSelector } from '../../../../store';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
  selectLpBreakdownByAddress,
} from '../../../data/selectors/tokens';
import { useMemo } from 'react';
import { BIG_ONE, BIG_ZERO } from '../../../../helpers/big-number';
import { CalculatedAsset, CalculatedBreakdownData, TokenAmounts } from './types';
import { TokenLpBreakdown } from '../../../data/entities/token';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import {
  selectGovVaultUserStackedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
} from '../../../data/selectors/balance';
import { BigNumber } from 'bignumber.js';
import { BeefyState } from '../../../../redux-types';

export const chartColors = [
  '#D9E7F2',
  '#ABCBE3',
  '#7DAFD3',
  '#4F93C4',
  '#3674A0',
  '#1d4159',
  '#152e3f',
];

function getTokenAmounts(
  state: BeefyState,
  chainId: string,
  breakdown: TokenLpBreakdown,
  userShareOfPool: BigNumber,
  oneLpShareOfPool: BigNumber,
  nextColor: number = 0
): TokenAmounts[] {
  return breakdown.tokens.flatMap((tokenAddress, i): TokenAmounts => {
    let reserves = new BigNumber(breakdown.balances[i]);
    const assetToken = selectTokenByAddress(state, chainId, tokenAddress);
    const valuePerDecimal = selectTokenPriceByAddress(state, chainId, tokenAddress);
    const totalValue = reserves.multipliedBy(valuePerDecimal);

    const subBreakdown = selectLpBreakdownByAddress(state, chainId, tokenAddress);
    let underlying: TokenAmounts[] | null = null;
    if (subBreakdown) {
      const subPoolTotalSupply = new BigNumber(subBreakdown.totalSupply);
      const adjustedSubBreakdown = {
        ...subBreakdown,
        balances: subBreakdown.balances.map(b =>
          new BigNumber(b).multipliedBy(reserves).dividedBy(subPoolTotalSupply).toString()
        ),
      };
      underlying = getTokenAmounts(
        state,
        chainId,
        adjustedSubBreakdown,
        userShareOfPool,
        oneLpShareOfPool,
        breakdown.tokens.length
      );
    }

    return {
      ...assetToken,
      underlying,
      totalAmount: reserves,
      userAmount: userShareOfPool.multipliedBy(reserves),
      oneAmount: oneLpShareOfPool.multipliedBy(reserves),
      totalValue,
      userValue: userShareOfPool.multipliedBy(totalValue),
      oneValue: oneLpShareOfPool.multipliedBy(totalValue),
      price: valuePerDecimal,
      color: chartColors[(i + nextColor) % chartColors.length],
    };
  });
}

function calculatePercents(assets: TokenAmounts[], totalValue: BigNumber): CalculatedAsset[] {
  return assets.map(asset => ({
    ...asset,
    underlying: asset.underlying ? calculatePercents(asset.underlying, totalValue) : null,
    percent: totalValue.gt(BIG_ZERO) ? asset.totalValue.dividedBy(totalValue).toNumber() : 0,
  }));
}

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
    getTokenAmounts(state, vault.chainId, breakdown, userShareOfPool, oneLpShareOfPool)
  );

  const totalValue = useMemo(() => {
    return assetsTemp.reduce((total, asset) => total.plus(asset.totalValue), BIG_ZERO);
  }, [assetsTemp]);

  const assetsWithTokens = useMemo(() => {
    return calculatePercents(assetsTemp, totalValue);
  }, [assetsTemp, totalValue]);

  return {
    vault: vault,
    asset: {
      ...lpToken,
      price: oneLpShareOfPool.multipliedBy(totalValue),
      percent: 100,
      color: '',
      underlying: assetsWithTokens,
      totalAmount: lpTotalSupplyDecimal,
      oneAmount: BIG_ONE,
      userAmount: userShareOfPool.multipliedBy(lpTotalSupplyDecimal),
      totalValue,
      oneValue: oneLpShareOfPool.multipliedBy(totalValue),
      userValue: userShareOfPool.multipliedBy(totalValue),
    },
    userBalance: userBalanceDecimal,
  };
}
