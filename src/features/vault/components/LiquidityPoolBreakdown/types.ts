import { ChainEntity } from '../../../data/entities/chain';
import { TokenEntity } from '../../../data/entities/token';
import { BigNumber } from 'bignumber.js';

export type BreakdownMode = 'user' | 'one' | 'total';

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
};

export type CalculatedBreakdownData = {
  chainId: ChainEntity['id'];
  token: TokenEntity;
  assets: CalculatedAsset[];
  totalAmount: BigNumber;
  oneAmount: BigNumber;
  userAmount: BigNumber;
  totalValue: BigNumber;
  userValue: BigNumber;
  oneValue: BigNumber;
  userBalance: BigNumber;
};
