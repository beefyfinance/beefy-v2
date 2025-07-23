import type { PairData as BasePairData } from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';

type PairData = BasePairData & {
  swapFee: BigNumber;
};

const MMFPairAbi = [
  {
    constant: true,
    inputs: [],
    name: 'swapFee',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class MMFUniswapV2Pool extends UniswapV2Pool {
  protected pairData: PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, MMFPairAbi, this.chain.id);
    const [_, swapFee] = await Promise.all([super.updatePairData(), contract.read.swapFee()]);
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    this.pairData.swapFee = new BigNumber(swapFee);
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.pairData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      numerator: this.pairData.swapFee,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
