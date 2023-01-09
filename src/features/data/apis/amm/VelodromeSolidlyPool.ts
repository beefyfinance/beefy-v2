import { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import BigNumber from 'bignumber.js';
import { SwapFeeParams } from './types';
import { SolidlyPool } from './SolidlyPool';
import { AbiItem } from 'web3-utils';

export type FactoryDataResponse = {
  fee: string;
};

export type FactoryData = {
  fee: BigNumber;
};

const VelodromeFactoryAbi: AbiItem[] = [
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
];

export class VelodromeSolidlyPool extends SolidlyPool {
  protected factoryData: FactoryData | null = null;

  protected getFactoryDataRequest(): ShapeWithLabel[] {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const contract = createContract(VelodromeFactoryAbi, this.amm.factoryAddress);

    return [
      {
        fee: contract.methods.getFee(this.pairData.stable),
      },
    ];
  }

  protected consumeFactoryDataResponse(untypedResult: any[]) {
    const result = (untypedResult as FactoryDataResponse[])[0];

    this.factoryData = {
      fee: new BigNumber(result.fee),
    };
  }

  async updateFactoryData() {
    const multicall = await this.getMulticall();
    const [results] = await multicall.all([this.getFactoryDataRequest()]);
    this.consumeFactoryDataResponse(results);
  }

  async updateAllData(otherCalls: ShapeWithLabel[][] = []): Promise<any[][]> {
    const otherResults = await super.updateAllData(otherCalls);

    await this.updateFactoryData();

    return otherResults;
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
