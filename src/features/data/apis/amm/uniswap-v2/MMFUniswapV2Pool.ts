import type {
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
} from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
import { BigNumber } from 'bignumber.js';
import type { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../../helpers/web3';
import type { SwapFeeParams } from '../types';
import type { AbiItem } from 'web3-utils';

type PairDataResponse = BasePairDataResponse & {
  swapFee: string;
};

type PairData = BasePairData & {
  swapFee: BigNumber;
};

const MMFPairAbi: AbiItem[] = [
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
];

export class MMFUniswapV2Pool extends UniswapV2Pool {
  protected pairData: PairData | undefined = undefined;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(MMFPairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        swapFee: contract.methods.swapFee(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: unknown[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    this.pairData.swapFee = new BigNumber(result.swapFee);
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
