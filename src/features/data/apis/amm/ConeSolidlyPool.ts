import {
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
  SolidlyPool,
} from './SolidlyPool';
import { SwapFeeParams } from './types';
import BigNumber from 'bignumber.js';
import { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import { AbiItem } from 'web3-utils';

type PairDataResponse = BasePairDataResponse & {
  swapFee: string;
};

type PairData = BasePairData & {
  swapFee: BigNumber;
};

const ConePairAbi: AbiItem[] = [
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
];

export class ConeSolidlyPool extends SolidlyPool {
  protected pairData: PairData | null = null;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(ConePairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        swapFee: contract.methods.swapFee(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: any[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    this.pairData.swapFee = new BigNumber(result.swapFee);
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
