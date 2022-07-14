import { useAppSelector } from '../../../../store';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
  selectLpBreakdownByAddress,
} from '../../../data/selectors/tokens';
import { useMemo } from 'react';
import { BIG_ONE, BIG_ZERO } from '../../../../helpers/big-number';
import { CalculatedBreakdownData } from './types';
import { TokenEntity, TokenLpBreakdown } from '../../../data/entities/token';
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

type TokenAmounts = TokenEntity & {
  totalAmount: BigNumber;
  userAmount: BigNumber;
  oneAmount: BigNumber;
  totalValue: BigNumber;
  userValue: BigNumber;
  oneValue: BigNumber;
  price: BigNumber;
  color: string;
};

function getTokenAmounts(
  state: BeefyState,
  chainId: string,
  breakdown: TokenLpBreakdown,
  userShareOfPool: BigNumber,
  oneLpShareOfPool: BigNumber
): TokenAmounts[] {
  return breakdown.tokens.flatMap((tokenAddress, i) => {
    let reserves = new BigNumber(breakdown.balances[i]);
    const assetToken = selectTokenByAddress(state, chainId, tokenAddress);
    const valuePerDecimal = selectTokenPriceByAddress(state, chainId, tokenAddress);
    const totalValue = reserves.multipliedBy(valuePerDecimal);

    const subBreakdown = selectLpBreakdownByAddress(state, chainId, tokenAddress);
    if (subBreakdown) {
      const subPoolTotalSupply = new BigNumber(subBreakdown.totalSupply);
      const adjustedSubBreakdown = {
        ...subBreakdown,
        balances: subBreakdown.balances.map(b =>
          new BigNumber(b).multipliedBy(reserves).dividedBy(subPoolTotalSupply).toString()
        ),
      };
      return getTokenAmounts(
        state,
        chainId,
        adjustedSubBreakdown,
        userShareOfPool,
        oneLpShareOfPool
      );
    }

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
  });
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
