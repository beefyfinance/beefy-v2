import type BigNumber from 'bignumber.js';
import type { ZapStep } from './types.ts';
import { getInsertIndex } from '../helpers/zap.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';

export function buildTokenApproveTx(
  token: string,
  spender: string,
  amountWei: BigNumber,
  insertBalance: boolean = false
): ZapStep {
  return {
    target: token,
    value: '0',
    data: encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'approve',
          constant: false,
          payable: false,
          inputs: [
            { type: 'address', name: 'spender' },
            {
              type: 'uint256',
              name: 'amount',
            },
          ],
          stateMutability: 'nonpayable',
          outputs: [{ type: 'bool', name: 'success' }],
        },
      ] as const satisfies Abi,
      args: [spender as Address, bigNumberToBigInt(amountWei)],
    }),
    tokens:
      insertBalance ?
        [
          {
            token,
            index: getInsertIndex(1), // this has side effect of approving the token to spend itself
          },
        ]
      : [],
  };
}
