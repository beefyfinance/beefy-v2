import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import { SolidlyPool } from './SolidlyPool.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi, Address } from 'abitype';

export type FactoryDataResponse = {
  fee: string;
};

export type FactoryData = {
  fee: BigNumber;
};

const BVMFactoryAbi = [
  {
    inputs: [{ internalType: 'address', name: '_pair', type: 'address' }],
    name: 'getFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class BVMSolidlyPool extends SolidlyPool {
  protected factoryData: FactoryData | undefined = undefined;

  protected async updateFactoryData() {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    const contract = fetchContract(this.amm.factoryAddress, BVMFactoryAbi, this.chain.id);
    const fee = await contract.read.getFee([this.address as Address]);
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
