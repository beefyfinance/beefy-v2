import { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import BigNumber from 'bignumber.js';
import { SwapFeeParams } from './types';
import {
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
  SolidlyPool,
} from './SolidlyPool';
import { AbiItem } from 'web3-utils';

type PairDataResponse = BasePairDataResponse & {
  feeRatio: string;
};

type PairData = BasePairData & {
  feeRatio: BigNumber;
};

const EthereumSolidlyPairAbi: AbiItem[] = [
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
];

export class EthereumSolidlyPool extends SolidlyPool {
  protected pairData: PairData | null = null;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(EthereumSolidlyPairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        feeRatio: contract.methods.feeRatio(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: any[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    this.pairData.feeRatio = new BigNumber(result.feeRatio);
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
