import type { ChainEntity } from '../../entities/chain.ts';
import type BigNumber from 'bignumber.js';

/** wei amounts are in the source chain's native token */
export type AxelarEstimateGasFeeResponse = {
  totalFee: string;
  isExpressSupported: boolean;
  baseFee: string;
  expressFee: string;
  executionFee: string;
  executionFeeWithMultiplier: string;
  gasLimit: string;
  gasLimitWithL1Fee: string;
  gasMultiplier: number;
  minGasPrice: string;
};

export interface IAxelarApi {
  /** @returns fee in wei of the source chain's native token */
  estimateGasFee(sourceChain: ChainEntity, destinationChain: ChainEntity): Promise<BigNumber>;
}
