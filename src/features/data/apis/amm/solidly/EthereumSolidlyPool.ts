import type { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../../helpers/web3';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
import type {
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
} from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { AbiItem } from 'web3-utils';

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
  protected pairData: PairData | undefined = undefined;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(EthereumSolidlyPairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        feeRatio: contract.methods.feeRatio(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: unknown[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

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
