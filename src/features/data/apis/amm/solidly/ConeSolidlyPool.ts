import type { PairData as BasePairData } from './SolidlyPool.ts';
import { SolidlyPool } from './SolidlyPool.ts';
import type { SwapFeeParams } from '../types.ts';
import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';

type PairData = BasePairData & {
  swapFee: BigNumber;
};

const ConePairAbi = [
  {
    inputs: [],
    name: 'swapFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class ConeSolidlyPool extends SolidlyPool {
  protected pairData: PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, ConePairAbi, this.chain.id);
    const [_, feeRatio] = await Promise.all([super.updatePairData(), contract.read.swapFee()]);
    this.pairData = {
      ...this.pairData!,
      swapFee: new BigNumber(feeRatio.toString(10)),
    };
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    return {
      numerator: new BigNumber(this.amm.swapFeeNumerator),
      denominator: this.pairData.swapFee,
    };
  }
}
