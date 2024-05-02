import type { ChainEntity } from '../../../data/entities/chain';
import type { TokenEntity } from '../../../data/entities/token';
import type { BigNumber } from 'bignumber.js';

export type BreakdownMode = 'user' | 'one' | 'total' | 'underlying';

export type CalculatedAsset = TokenEntity & {
  totalAmount: BigNumber;
  oneAmount: BigNumber;
  userAmount: BigNumber;
  totalValue: BigNumber;
  userValue: BigNumber;
  oneValue: BigNumber;
  price: BigNumber;
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
