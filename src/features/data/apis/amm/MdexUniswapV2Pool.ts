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
  pairRate: string;
  pairFees: string;
};

export type FactoryData = BaseFactoryData & {
  pairRate: BigNumber;
  pairFees: BigNumber;
};

const MINT_FEE_DISABLED_RATE = new BigNumber(9);

const MdexFactoryAbi: AbiItem[] = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
    ],
    name: 'getPairFees',
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
    inputs: [
      {
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
    ],
    name: 'getPairRate',
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

export class MdexUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | null = null;

  protected getFactoryDataRequest(): ShapeWithLabel[] {
    const contract = createContract(MdexFactoryAbi, this.amm.factoryAddress);
    return [
      {
        ...super.getFactoryDataRequest()[0],
        pairRate: contract.methods.getPairRate(this.address),
        pairFees: contract.methods.getPairFees(this.address),
      },
    ];
  }

  protected consumeFactoryDataResponse(untypedResult: any[]) {
    const result = (untypedResult as FactoryDataResponse[])[0];

    super.consumeFactoryDataResponse(untypedResult);

    this.factoryData.pairRate = new BigNumber(result.pairRate);
    this.factoryData.pairFees = new BigNumber(result.pairFees);
  }

  protected getMintFeeParams(): MintFeeParams {
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    const { feeTo, pairRate } = this.factoryData;

    return {
      feeOn: feeTo !== ZERO_ADDRESS && !pairRate.eq(MINT_FEE_DISABLED_RATE),
      numerator: new BigNumber(this.amm.mintFeeNumerator),
      denominator: pairRate,
    };
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      numerator: this.factoryData.pairFees,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
