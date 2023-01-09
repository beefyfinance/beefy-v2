import {
  MintFeeParams,
  PairData as BasePairData,
  PairDataResponse as BasePairDataResponse,
  UniswapV2Pool,
} from './UniswapV2Pool';
import { BigNumber } from 'bignumber.js';
import { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import { ZERO_ADDRESS } from '../../../../helpers/addresses';
import { SwapFeeParams } from './types';
import { AbiItem } from 'web3-utils';

type PairDataResponse = BasePairDataResponse & {
  devFee: string;
  swapFee: string;
};

type PairData = BasePairData & {
  devFee: BigNumber;
  swapFee: BigNumber;
};

const BiSwapPairAbi: AbiItem[] = [
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
  {
    constant: true,
    inputs: [],
    name: 'devFee',
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

export class BiSwapUniswapV2Pool extends UniswapV2Pool {
  protected pairData: PairData | null = null;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(BiSwapPairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        devFee: contract.methods.devFee(),
        swapFee: contract.methods.swapFee(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: any[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    this.pairData.devFee = new BigNumber(result.devFee);
    this.pairData.swapFee = new BigNumber(result.swapFee);
  }

  protected getMintFeeParams(): MintFeeParams {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      feeOn: this.factoryData.feeTo !== ZERO_ADDRESS,
      numerator: new BigNumber(this.amm.mintFeeNumerator),
      denominator: this.pairData.devFee,
    };
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
