import type BigNumber from 'bignumber.js';
import type { ZapStep } from '../../transact/zap/types.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import { VelodromeV2SolidlyPool } from './VelodromeV2SolidlyPool.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';

/**
 * Same as VelodromeV2SolidlyPool but the swap route does not include the factory address
 */
export class VelodromeV2ModeSolidlyPool extends VelodromeV2SolidlyPool {
  protected buildZapSwapTx(
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    routes: { from: string; to: string }[],
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
