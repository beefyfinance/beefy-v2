import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types.ts';
import type { PairData } from './SolidlyPool.ts';
import { SolidlyPool } from './SolidlyPool.ts';
import type { ZapStep } from '../../transact/zap/types.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';

export type FactoryData = {
  fee: BigNumber;
};

const BlackholeFactoryAbi = [
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

export type BlackholePairData = PairData & {
  factory: string;
};

export class BlackholeSolidlyPool extends SolidlyPool {
  protected pairData: BlackholePairData | undefined = undefined;
  protected factoryData: FactoryData | undefined = undefined;

  async updateFactoryData() {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    const contract = fetchContract(this.amm.factoryAddress, BlackholeFactoryAbi, this.chain.id);
    const fee = await contract.read.getFee([this.address as Address, this.pairData.stable]);
    this.factoryData = {
      fee: new BigNumber(fee.toString(10)),
    };
  }

  async updateAllData() {
    // No longer needed since we are overriding pairData here
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
    if (routes.length > 1) {
      // @dev we need the pair address of the next hop to set as receiver
      throw new Error('BlackholeSolidlyPool does not support multi-hop swaps');
    }

    return {
      target: this.amm.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'pair',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'from',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'to',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'stable',
                    type: 'bool',
                  },
                  {
                    internalType: 'bool',
                    name: 'concentrated',
                    type: 'bool',
                  },
                  {
                    internalType: 'address',
                    name: 'receiver',
                    type: 'address',
                  },
                ],
                internalType: 'struct IRouter.route[]',
                name: 'routes',
                type: 'tuple[]',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
              },
            ],
            name: 'swapExactTokensForTokens',
            outputs: [
              {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const satisfies Abi,
        functionName: 'swapExactTokensForTokens',
        args: [
          bigNumberToBigInt(amountIn),
          bigNumberToBigInt(amountOutMin),
          routes.map(({ from: fromToken, to: toToken }) => ({
            pair: this.address as Address,
            from: fromToken as Address,
            to: toToken as Address,
            stable: pairData.stable,
            concentrated: false,
            receiver: to as Address, // since we don't support multi-hop, receiver is the final 'to'
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
