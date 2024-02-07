import abiCoder from 'web3-eth-abi';
import type { BigNumber } from 'bignumber.js';
import type { ZapStep } from './types';
import { getInsertIndex } from '../helpers/zap';

export function buildTokenApproveTx(
  token: string,
  spender: string,
  amountWei: BigNumber,
  insertBalance: boolean = false
): ZapStep {
  return {
    target: token,
    value: '0',
    data: abiCoder.encodeFunctionCall(
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
        outputs: [{ type: 'bool', name: 'success' }],
      },
      [spender, amountWei.toString(10)]
    ),
    tokens: insertBalance
      ? [
          {
            token,
            index: getInsertIndex(1), // this has side effect of approving the token to spend itself
          },
        ]
      : [],
  };
}
