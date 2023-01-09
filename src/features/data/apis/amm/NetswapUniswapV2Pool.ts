import {
  FactoryData as BaseFactoryData,
  FactoryDataResponse as BaseFactoryDataResponse,
  UniswapV2Pool,
} from './UniswapV2Pool';
import { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import BigNumber from 'bignumber.js';
import { SwapFeeParams } from './types';
import { AbiItem } from 'web3-utils';

export type FactoryDataResponse = BaseFactoryDataResponse & {
  feeRate: string;
};

export type FactoryData = BaseFactoryData & {
  feeRate: BigNumber;
};

const NetswapFactoryAbi: AbiItem[] = [
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'feeRate',
    inputs: [],
  },
];

export class NetswapUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | null = null;

  protected getFactoryDataRequest(): ShapeWithLabel[] {
    const contract = createContract(NetswapFactoryAbi, this.amm.factoryAddress);
    return [
      {
        ...super.getFactoryDataRequest()[0],
        feeRate: contract.methods.feeRate(),
      },
    ];
  }

  protected consumeFactoryDataResponse(untypedResult: any[]) {
    const result = (untypedResult as FactoryDataResponse[])[0];

    super.consumeFactoryDataResponse(untypedResult);

    this.factoryData.feeRate = new BigNumber(result.feeRate);
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      numerator: this.factoryData.feeRate,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
