import type {
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
} from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { SwapFeeParams } from '../types';
import { BigNumber } from 'bignumber.js';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi } from 'abitype';

type PairDataResponse = BasePairDataResponse & {
  fee: string;
};

type PairData = BasePairData & {
  fee: BigNumber;
};

const SpiritSwapPairAbi = [
  {
    inputs: [],
    name: 'fee',
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

export class SpiritSwapV2SolidlyPool extends SolidlyPool {
  protected pairData: PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, SpiritSwapPairAbi, this.chain.id);
    const [_, fee] = await Promise.all([super.updatePairData(), contract.read.fee()]);
    this.pairData = {
      ...this.pairData!,
      fee: new BigNumber(fee.toString(10)),
    };
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    return {
      numerator: new BigNumber(this.amm.swapFeeNumerator),
      denominator: this.pairData.fee,
    };
  }
}
