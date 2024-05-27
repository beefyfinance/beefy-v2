import type { BigNumber } from 'bignumber.js';
import abiCoder from 'web3-eth-abi';
import type { ZapStep } from '../../transact/zap/types';
import { getInsertIndex } from '../../transact/helpers/zap';
import { VelodromeV2SolidlyPool } from './VelodromeV2SolidlyPool';

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
      data: abiCoder.encodeFunctionCall(
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
        },
        [
          amountIn.toString(10),
          amountOutMin.toString(10),
          routes.map(({ from, to }) => [from, to, pairData.stable]),
          to,
          deadline.toString(10),
        ]
      ),
      tokens: [
        {
          token: routes[0].from,
          index: insertBalance ? getInsertIndex(0) : -1, // amountIn
        },
      ],
    };
  }
}
