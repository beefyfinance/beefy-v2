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
import type { Abi } from 'viem';

export type FactoryDataResponse = BaseFactoryDataResponse & {
  mintFee: string;
  swapFee: string;
};

export type FactoryData = BaseFactoryData & {
  mintFee: BigNumber;
  swapFee: BigNumber;
};

const TombSwapPairAbi = [
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
] as const satisfies Abi;

export class TombSwapUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | undefined = undefined;

  protected async updateFactoryData() {
    const contract = fetchContract(this.amm.factoryAddress, TombSwapPairAbi, this.chain.id);
    const [_, mintFee, swapFee] = await Promise.all([
      super.updateFactoryData(),
      contract.read.mintFee(),
      contract.read.swapFee(),
    ]);
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }
    this.factoryData.mintFee = new BigNumber(mintFee.toString(10));
    this.factoryData.swapFee = new BigNumber(swapFee.toString(10));
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
