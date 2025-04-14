import type { TokenEntity } from '../entities/token.ts';
import type BigNumber from 'bignumber.js';

export type UserLpBreakdownBalanceAsset = TokenEntity & {
  totalAmount: BigNumber;
  userAmount: BigNumber;
  oneAmount: BigNumber;
  underlyingAmount: BigNumber;
  totalValue: BigNumber;
  totalUnderlyingValue: BigNumber;
  userValue: BigNumber;
  oneValue: BigNumber;
  underlyingValue: BigNumber;
  price: BigNumber;
};

export type UserLpBreakdownBalance = {
  assets: UserLpBreakdownBalanceAsset[];
  userShareOfPool: BigNumber;
  lpTotalSupplyDecimal: BigNumber;
  userBalanceDecimal: BigNumber;
  oneLpShareOfPool: BigNumber;
  underlyingTotalSupplyDecimal: BigNumber;
  underlyingShareOfPool: BigNumber;
};
