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
import { AbiItem } from 'web3-utils';

type PairDataResponse = BasePairDataResponse & {
  devFee: string;
};

type PairData = BasePairData & {
  devFee: BigNumber;
};

const StellaPairAbi: AbiItem[] = [
  {
    inputs: [],
    name: 'devFee',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export class StellaUniswapV2Pool extends UniswapV2Pool {
  protected pairData: PairData | null = null;

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(StellaPairAbi, this.address);
    return [
      {
        ...super.getPairDataRequest()[0],
        devFee: contract.methods.devFee(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: any[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    super.consumePairDataResponse(untypedResult);

    this.pairData.devFee = new BigNumber(result.devFee);
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
}
