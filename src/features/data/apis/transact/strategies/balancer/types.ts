import type { TokenEntity } from '../../../../entities/token';
import type BigNumber from 'bignumber.js';

export type BalancerTokenOption = {
  index: number;
  token: TokenEntity;
  price: BigNumber;
};
