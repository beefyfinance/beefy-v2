import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import type { PairData, PairDataResponse } from './SolidlyPool.ts';
import { SolidlyPool } from './SolidlyPool.ts';
import { VelodromeV2PairAbi } from '../../../../../config/abi/VelodromeV2PairAbi.ts';
import type { ZapStep } from '../../transact/zap/types.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';

export type FactoryDataResponse = {
  fee: string;
};

export type FactoryData = {
  fee: BigNumber;
};

const VelodromeFactoryAbi = [
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
] as const satisfies Abi;

export type VelodromeV2PairData = PairData & {
  factory: string;
};

export type VelodromeV2PairDataResponse = PairDataResponse & {
  factory: string;
};

export class VelodromeV2SolidlyPool extends SolidlyPool {
  protected pairData: VelodromeV2PairData | undefined = undefined;
  protected factoryData: FactoryData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, VelodromeV2PairAbi, this.chain.id);
    const [
      totalSupply,
      decimals,
      [decimal0, decimal1, reserves0, reserves1, stable, token0, token1],
      factory,
    ] = await Promise.all([
      contract.read.totalSupply(),
      contract.read.decimals(),
      contract.read.metadata(),
      contract.read.factory(),
    ]);

    this.pairData = {
      totalSupply: new BigNumber(totalSupply.toString(10)),
      decimals: decimals,
      token0: token0,
      token1: token1,
      reserves0: new BigNumber(reserves0.toString(10)),
      reserves1: new BigNumber(reserves1.toString(10)),
      decimals0: new BigNumber(decimal0.toString(10)).e!, // 1e18 -> 18
      decimals1: new BigNumber(decimal1.toString(10)).e!,
      stable: stable,
      factory: factory,
    };
  }

  async updateFactoryData() {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    const contract = fetchContract(this.pairData.factory, VelodromeFactoryAbi, this.chain.id);
    const fee = await contract.read.getFee([this.address as Address, this.pairData.stable]);
    this.factoryData = {
      fee: new BigNumber(fee.toString(10)),
    };
  }

  async updateAllData() {
    // Not longer needed since we are overriding pairData here
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

  protected buildZapSwapTx(
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    routes: {
      from: string;
      to: string;
    }[],
    to: string,
    deadline: number,
    insertBalance: boolean
  ): ZapStep {
    const pairData = this.pairData;
    if (!pairData) {
      throw new Error('Pair data is not loaded');
    }

    return {
      target: this.amm.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'swapExactTokensForTokens',
            constant: false,
            payable: false,
            inputs: [
              { type: 'uint256', name: 'amountIn' },
              {
                type: 'uint256',
                name: 'amountOutMin',
              },
              {
                type: 'tuple[]',
                name: 'routes',
                components: [
                  { type: 'address', name: 'from' },
                  { type: 'address', name: 'to' },
                  {
                    type: 'bool',
                    name: 'stable',
                  },
                  { type: 'address', name: 'factory' },
                ],
              },
              { type: 'address', name: 'to' },
              { type: 'uint256', name: 'deadline' },
            ],
            outputs: [{ type: 'uint256[]', name: 'amounts' }],
            stateMutability: 'nonpayable',
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(amountIn),
          bigNumberToBigInt(amountOutMin),
          routes.map(({ from, to }) => ({
            from: from as Address,
            to: to as Address,
            stable: pairData.stable,
            factory: pairData.factory as Address,
          })),
          to as Address,
          BigInt(deadline),
        ],
      }),
      tokens: [
        {
          token: routes[0].from,
          index: insertBalance ? getInsertIndex(0) : -1, // amountIn
        },
      ],
    };
  }
}
