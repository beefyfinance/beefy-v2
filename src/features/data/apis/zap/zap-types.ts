import { TokenEntity } from '../../entities/token';
import BigNumber from 'bignumber.js';
import { ZapConfig } from '../config-types';

export interface ZapOptions {
  address: string;
  router: string;
  tokens: TokenEntity[];
  type: ZapConfig['type'];
  withdrawEstimateMode: ZapConfig['withdrawEstimateMode'];
  withdrawEstimateFee: ZapConfig['withdrawEstimateFee'];
  lpProviderFee: ZapConfig['lpProviderFee'];
}

export interface ZapEstimate {
  tokenIn: TokenEntity;
  tokenOut: TokenEntity;
  amountIn: BigNumber;
  amountOut: BigNumber;
  priceImpact: number;
}
