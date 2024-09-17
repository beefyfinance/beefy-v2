import abiCoder from 'web3-eth-abi';
import { WeightedPoolExitKind, WeightedPoolJoinKind } from './types';

export class WeightedPoolEncoder {
  private constructor() {
    // static only
  }

  /**
   * Encodes the userData parameter for providing the initial liquidity to a WeightedPool
   * @param initialBalances - the amounts of tokens to send to the pool to form the initial balances
   */
  static joinInit(initialBalances: string[]): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256[]'],
      [WeightedPoolJoinKind.INIT, initialBalances]
    );
  }

  /**
   * Encodes the userData parameter for joining a WeightedPool with exact token inputs
   * @param amountsIn - the amounts each of token to deposit in the pool as liquidity
   * @param minimumBPT - the minimum acceptable BPT to receive in return for deposited tokens
   */
  static joinExactTokensInForBPTOut(amountsIn: string[], minimumBPT: string): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256[]', 'uint256'],
      [WeightedPoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, amountsIn, minimumBPT]
    );
  }

  /**
   * Encodes the userData parameter for joining a WeightedPool with a single token to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   * @param enterTokenIndex - the index of the token to be provided as liquidity
   */
  static joinTokenInForExactBPTOut(bptAmountOut: string, enterTokenIndex: number): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256', 'uint256'],
      [WeightedPoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT, bptAmountOut, enterTokenIndex]
    );
  }

  /**
   * Encodes the userData parameter for joining a WeightedPool proportionally to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   */
  static joinAllTokensInForExactBPTOut(bptAmountOut: string): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256'],
      [WeightedPoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT, bptAmountOut]
    );
  }

  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing a single token in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   * @param exitTokenIndex - the index of the token to removed from the pool
   */
  static exitExactBPTInForOneTokenOut(bptAmountIn: string, exitTokenIndex: number): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256', 'uint256'],
      [WeightedPoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT, bptAmountIn, exitTokenIndex]
    );
  }

  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing tokens in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   */
  static exitExactBPTInForTokensOut(bptAmountIn: string): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256'],
      [WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, bptAmountIn]
    );
  }

  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing exact amounts of tokens
   * @param amountsOut - the amounts of each token to be withdrawn from the pool
   * @param maxBPTAmountIn - the minimum acceptable BPT to burn in return for withdrawn tokens
   */
  static exitBPTInForExactTokensOut(amountsOut: string[], maxBPTAmountIn: string): string {
    return abiCoder.encodeParameters(
      ['uint256', 'uint256[]', 'uint256'],
      [WeightedPoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT, amountsOut, maxBPTAmountIn]
    );
  }
}
