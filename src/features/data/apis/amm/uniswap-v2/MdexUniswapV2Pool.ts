import type {
  MintFeeParams,
  FactoryData as BaseFactoryData,
  FactoryDataResponse as BaseFactoryDataResponse,
} from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi, Address } from 'viem';

export type FactoryDataResponse = BaseFactoryDataResponse & {
  pairRate: string;
  pairFees: string;
};

export type FactoryData = BaseFactoryData & {
  pairRate: BigNumber;
  pairFees: BigNumber;
};

const MINT_FEE_DISABLED_RATE = new BigNumber(9);

const MdexFactoryAbi = [
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
] as const satisfies Abi;

export class MdexUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | undefined = undefined;

  protected async updateFactoryData() {
    const contract = fetchContract(this.amm.factoryAddress, MdexFactoryAbi, this.chain.id);
    const [_, pairRate, pairFees] = await Promise.all([
      super.updateFactoryData(),
      contract.read.getPairRate([this.address as Address]),
      contract.read.getPairFees([this.address as Address]),
    ]);
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }
    this.factoryData.pairRate = new BigNumber(pairRate.toString(10));
    this.factoryData.pairFees = new BigNumber(pairFees.toString(10));
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
