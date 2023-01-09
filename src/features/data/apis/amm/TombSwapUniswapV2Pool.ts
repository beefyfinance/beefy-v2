import {
  MintFeeParams,
  UniswapV2Pool,
  FactoryData as BaseFactoryData,
  FactoryDataResponse as BaseFactoryDataResponse,
} from './UniswapV2Pool';
import { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import { ZERO_ADDRESS } from '../../../../helpers/addresses';
import BigNumber from 'bignumber.js';
import { SwapFeeParams } from './types';
import { AbiItem } from 'web3-utils';

export type FactoryDataResponse = BaseFactoryDataResponse & {
  mintFee: string;
  swapFee: string;
};

export type FactoryData = BaseFactoryData & {
  mintFee: BigNumber;
  swapFee: BigNumber;
};

const TombSwapPairAbi: AbiItem[] = [
  {
    constant: true,
    inputs: [],
    name: 'mintFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'swapFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

export class TombSwapUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | null = null;

  protected getFactoryDataRequest(): ShapeWithLabel[] {
    const contract = createContract(TombSwapPairAbi, this.amm.factoryAddress);
    return [
      {
        ...super.getFactoryDataRequest()[0],
        mintFee: contract.methods.mintFee(),
        swapFee: contract.methods.swapFee(),
      },
    ];
  }

  protected consumeFactoryDataResponse(untypedResult: any[]) {
    const result = (untypedResult as FactoryDataResponse[])[0];

    super.consumeFactoryDataResponse(untypedResult);

    this.factoryData.mintFee = new BigNumber(result.mintFee);
    this.factoryData.swapFee = new BigNumber(result.swapFee);
  }

  protected getMintFeeParams(): MintFeeParams {
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    const { feeTo, mintFee } = this.factoryData;

    return {
      feeOn: feeTo !== ZERO_ADDRESS,
      numerator: new BigNumber(this.amm.mintFeeNumerator),
      denominator: mintFee,
    };
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      numerator: this.factoryData.swapFee,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
