import type { ChainEntity } from '../../entities/chain.ts';
import type BigNumber from 'bignumber.js';

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
