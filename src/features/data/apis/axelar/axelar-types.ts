import type { ChainEntity } from '../../entities/chain';
import type BigNumber from 'bignumber.js';

export interface IAxelarApi {
  estimateGasFee(
    sourceChain: ChainEntity,
    destinationChain: ChainEntity,
    gasLimit: BigNumber,
    sourceAddress: string,
    destinationAddress: string
  ): Promise<BigNumber>;
}
