import type {
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
} from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { SwapFeeParams } from '../types';
import BigNumber from 'bignumber.js';
import type { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../../helpers/web3';
import type { AbiItem } from 'web3-utils';

type PairDataResponse = BasePairDataResponse & {
  fee: string;
};

type PairData = BasePairData & {
  fee: BigNumber;
};

const SpiritSwapPairAbi: AbiItem[] = [
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
];

export class SpiritSwapV2SolidlyPool extends SolidlyPool {
  protected pairData: PairData | undefined = undefined;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(SpiritSwapPairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        fee: contract.methods.fee(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: unknown[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    this.pairData.fee = new BigNumber(result.fee);
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
