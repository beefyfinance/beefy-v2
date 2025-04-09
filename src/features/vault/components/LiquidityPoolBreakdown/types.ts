import type { ChainEntity } from '../../../data/entities/chain.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import type BigNumber from 'bignumber.js';
import type { UserLpBreakdownBalanceAsset } from '../../../data/selectors/balance-types.ts';

export type BreakdownMode = 'user' | 'one' | 'total' | 'underlying';

export type CalculatedAsset = UserLpBreakdownBalanceAsset & {
  color: string;
  percent: number;
  underlyingPercent: number;
};

export type CalculatedBreakdownData = {
  chainId: ChainEntity['id'];
  token: TokenEntity;
  assets: CalculatedAsset[];
  totalAmount: BigNumber;
  oneAmount: BigNumber;
  userAmount: BigNumber;
  underlyingAmount: BigNumber;
  totalValue: BigNumber;
  userValue: BigNumber;
  oneValue: BigNumber;
  underlyingValue: BigNumber;
  userBalance: BigNumber;
  underlyingBalance: BigNumber;
};
