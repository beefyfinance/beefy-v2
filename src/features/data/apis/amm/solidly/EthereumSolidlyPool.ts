import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import type { PairData as BasePairData } from './SolidlyPool.ts';
import { SolidlyPool } from './SolidlyPool.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';

type PairData = BasePairData & {
  feeRatio: BigNumber;
};

const EthereumSolidlyPairAbi = [
  {
    inputs: [],
    name: 'feeRatio',
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

export class EthereumSolidlyPool extends SolidlyPool {
  protected pairData: PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, EthereumSolidlyPairAbi, this.chain.id);
    const [_, feeRatio] = await Promise.all([super.updatePairData(), contract.read.feeRatio()]);
    this.pairData = {
      ...this.pairData!,
      feeRatio: new BigNumber(feeRatio.toString(10)),
    };
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    return {
      numerator: this.pairData.feeRatio,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
