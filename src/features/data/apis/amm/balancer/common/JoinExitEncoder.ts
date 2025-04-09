import {
  type ExitPoolUserData,
  type JoinPoolUserData,
  PoolExitKind,
  PoolJoinKind,
} from './types.ts';
import { encodeAbiParameters, type Hex } from 'viem';
import type BigNumber from 'bignumber.js';

function bigNumberToBigInt(bn: BigNumber): bigint {
  return BigInt(bn.toString(10));
}

function numberToBigInt(n: number): bigint {
  return BigInt(n);
}

export class JoinExitEncoder {
  private constructor() {
    // static only
  }

  static encodeJoin(join: JoinPoolUserData): Hex {
    switch (join.kind) {
      case PoolJoinKind.INIT: {
        throw new Error('Join kind INIT is not supported');
      }
      case PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT: {
        return encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256[]' }, { type: 'uint256' }],
          [
            numberToBigInt(join.kindValue),
            join.amountsIn.map(bigNumberToBigInt),
            bigNumberToBigInt(join.minimumBPT),
          ]
        );
      }
      case PoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT: {
        return encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
          [
            numberToBigInt(join.kindValue),
            bigNumberToBigInt(join.bptAmountOut),
            numberToBigInt(join.enterTokenIndex),
          ]
        );
      }
      case PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT: {
        return encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }],
          [numberToBigInt(join.kindValue), bigNumberToBigInt(join.bptAmountOut)]
        );
      }
      default: {
        throw new Error('Invalid join kind');
      }
    }
  }

  static encodeExit(exit: ExitPoolUserData): Hex {
    switch (exit.kind) {
      case PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT: {
        return encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
          [
            numberToBigInt(exit.kindValue),
            bigNumberToBigInt(exit.bptAmountIn),
            numberToBigInt(exit.exitTokenIndex),
          ]
        );
      }
      case PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT: {
        return encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }],
          [numberToBigInt(exit.kindValue), bigNumberToBigInt(exit.bptAmountIn)]
        );
      }
      case PoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT: {
        return encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256[]' }, { type: 'uint256' }],
          [
            numberToBigInt(exit.kindValue),
            exit.amountsOut.map(bigNumberToBigInt),
            bigNumberToBigInt(exit.maxBPTAmountIn),
          ]
        );
      }
      default: {
        throw new Error('Invalid exit kind');
      }
    }
  }
}
