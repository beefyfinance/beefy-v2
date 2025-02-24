import { BigNumber } from 'bignumber.js';
import type { SwapFeeParams } from '../types';
import { SolidlyPool } from './SolidlyPool';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi } from 'abitype';

export type FactoryDataResponse = {
  fee: string;
};

export type FactoryData = {
  fee: BigNumber;
};

const VelodromeFactoryAbi = [
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_stable',
        type: 'bool',
      },
    ],
    name: 'getFee',
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
] as const satisfies Abi;

export class VelodromeSolidlyPool extends SolidlyPool {
  protected factoryData: FactoryData | undefined = undefined;

  protected async updateFactoryData() {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    const contract = fetchContract(this.amm.factoryAddress, VelodromeFactoryAbi, this.chain.id);
    const fee = await contract.read.getFee([this.pairData.stable]);
    this.factoryData = {
      fee: new BigNumber(fee.toString(10)),
    };
  }

  async updateAllData() {
    await super.updateAllData();
    await this.updateFactoryData();
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      numerator: this.factoryData.fee,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
