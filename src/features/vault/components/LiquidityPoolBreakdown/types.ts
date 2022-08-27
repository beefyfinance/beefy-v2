import { ChainEntity } from '../../../data/entities/chain';
import { TokenEntity } from '../../../data/entities/token';
import { BigNumber } from 'bignumber.js';
import { VaultEntity } from '../../../data/entities/vault';

export type BreakdownMode = 'user' | 'one' | 'total';

type Amounts = {
  totalAmount: BigNumber;
  oneAmount: BigNumber;
  userAmount: BigNumber;
  totalValue: BigNumber;
  userValue: BigNumber;
  oneValue: BigNumber;
};

export type TokenAmounts = TokenEntity &
  Amounts & {
    price: BigNumber;
    color: string;
    underlying?: TokenAmounts[];
  };

export type CalculatedAsset = TokenEntity &
  TokenAmounts & {
    percent: number;
    underlying?: CalculatedAsset[];
  };

export type CalculatedBreakdownData = {
  vault: VaultEntity;
  asset: CalculatedAsset;
  userBalance: BigNumber;
};
