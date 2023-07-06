import type { ShapeWithLabel } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from './types';
import type { PairData, PairDataResponse } from './SolidlyPool';
import { MetadataKeys, SolidlyPool } from './SolidlyPool';
import type { AbiItem } from 'web3-utils';
import { VelodromeV2PairAbi } from '../../../../config/abi';

export type FactoryDataResponse = {
  fee: string;
};

export type FactoryData = {
  fee: BigNumber;
};

const VelodromeFactoryAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'address', name: 'pool', type: 'address' },
      {
        internalType: 'bool',
        name: '_stable',
        type: 'bool',
      },
    ],
    name: 'getFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export type VelodromeV2PairData = PairData & {
  factory: string;
};

export type VelodromeV2PairDataResponse = PairDataResponse & {
  factory: string;
};

export class VelodromeV2SolidlyPool extends SolidlyPool {
  protected pairData: VelodromeV2PairData | null = null;
  protected factoryData: FactoryData | null = null;

  protected getFactoryDataRequest(): ShapeWithLabel[] {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const contract = createContract(VelodromeFactoryAbi, this.pairData.factory);

    return [
      {
        fee: contract.methods.getFee(this.address, this.pairData.stable),
      },
    ];
  }

  protected consumeFactoryDataResponse(untypedResult: unknown[]) {
    const result = (untypedResult as FactoryDataResponse[])[0];

    this.factoryData = {
      fee: new BigNumber(result.fee),
    };
  }

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(VelodromeV2PairAbi, this.address);
    return [
      {
        totalSupply: contract.methods.totalSupply(),
        decimals: contract.methods.decimals(),
        metadata: contract.methods.metadata(),
        factory: contract.methods.factory(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: unknown[]) {
    const result = (untypedResult as VelodromeV2PairDataResponse[])[0];

    this.pairData = {
      totalSupply: new BigNumber(result.totalSupply),
      decimals: parseInt(result.decimals, 10),
      token0: result.metadata[MetadataKeys.token0],
      token1: result.metadata[MetadataKeys.token1],
      reserves0: new BigNumber(result.metadata[MetadataKeys.reserves0]),
      reserves1: new BigNumber(result.metadata[MetadataKeys.reserves1]),
      decimals0: new BigNumber(result.metadata[MetadataKeys.decimals0]).e, // 1e18 -> 18
      decimals1: new BigNumber(result.metadata[MetadataKeys.decimals1]).e,
      stable: result.metadata[MetadataKeys.stable],
      factory: result.factory,
    };
  }

  async updateFactoryData() {
    const multicall = await this.getMulticall();
    const [results] = await multicall.all([this.getFactoryDataRequest()]);
    this.consumeFactoryDataResponse(results);
  }

  async updateAllData(otherCalls: ShapeWithLabel[][] = []): Promise<unknown[][]> {
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
