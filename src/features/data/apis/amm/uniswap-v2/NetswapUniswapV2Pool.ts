import type {
  FactoryData as BaseFactoryData,
  FactoryDataResponse as BaseFactoryDataResponse,
} from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import type { Abi } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

export type FactoryDataResponse = BaseFactoryDataResponse & {
  feeRate: string;
};

export type FactoryData = BaseFactoryData & {
  feeRate: BigNumber;
};

const NetswapFactoryAbi = [
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
] as const satisfies Abi;

export class NetswapUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | undefined = undefined;

  protected async updateFactoryData() {
    const contract = fetchContract(this.amm.factoryAddress, NetswapFactoryAbi, this.chain.id);
    const [_, feeRate] = await Promise.all([super.updateFactoryData(), contract.read.feeRate()]);
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }
    this.factoryData.feeRate = new BigNumber(feeRate.toString(10));
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
