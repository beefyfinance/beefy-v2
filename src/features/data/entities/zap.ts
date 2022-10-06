export type ZapEntity = {
  zapAddress: string;
  ammRouter: string;
  ammFactory: string;
  ammPairInitHash: string;
  type: 'uniswapv2' | 'solidly';
  withdrawEstimateMode: 'getAmountOut' | 'getAmountsOut' | 'getAmountOutWithFee';
  withdrawEstimateFee: string;
  lpProviderFee: number;
};
