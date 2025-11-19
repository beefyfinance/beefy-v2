import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../chains/entity-types.ts';

export interface IAxelarApi {
  /** @returns fee in wei of the source chain's native token */
  estimateGasFee(
    sourceChain: ChainEntity,
    destinationChain: ChainEntity,
    gasLimit: BigNumber,
    sourceAddress: string,
    destinationAddress: string
  ): Promise<BigNumber>;
}
