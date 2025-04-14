import { AllPool } from './AllPool.ts';
import type { IBalancerAllPool, IBalancerSinglePool } from '../types.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import {
  type PoolConfig,
  type QueryExitPoolResponse,
  type QueryJoinPoolResponse,
  type VaultConfig,
} from '../vault/types.ts';
import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { type ExitPoolUserData, PoolExitKind } from './types.ts';
import type { ZapStep } from '../../../transact/zap/types.ts';

/** Join/Exit with one token or all tokens in ratio */
export abstract class SingleAllPool
  extends AllPool
  implements IBalancerSinglePool, IBalancerAllPool
{
  protected constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);
  }

  async quoteAddLiquidityOneToken(
    amountIn: BigNumber,
    tokenIn: string
  ): Promise<QueryJoinPoolResponse> {
    const amountsIn = this.config.tokens.map(t => (t.address === tokenIn ? amountIn : BIG_ZERO));
    return this.quoteAddLiquidity(amountsIn);
  }

  async quoteRemoveLiquidityOneToken(
    liquidityIn: BigNumber,
    tokenOut: string
  ): Promise<QueryExitPoolResponse> {
    const wantedIndex = this.config.tokens.findIndex(t => t.address === tokenOut);
    if (wantedIndex === -1) {
      throw new Error('Token not found in pool');
    }

    const userData: ExitPoolUserData = {
      kind: PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
      kindValue: this.getExitKindValue(PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT),
      bptAmountIn: liquidityIn,
      exitTokenIndex: wantedIndex,
    };

    return this.quoteRemoveLiquidityWithUserData(liquidityIn, userData);
  }

  async getAddLiquidityOneTokenZap(
    amountIn: BigNumber,
    tokenIn: string,
    liquidityOutMin: BigNumber,
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep> {
    const amountsIn = this.config.tokens.map(t => (t.address === tokenIn ? amountIn : BIG_ZERO));
    return this.getAddLiquidityZap(amountsIn, liquidityOutMin, from, insertBalance);
  }

  async getRemoveLiquidityOneTokenZap(
    liquidityIn: BigNumber,
    tokenOut: string,
    amountOutMin: BigNumber,
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep> {
    const wantedIndex = this.config.tokens.findIndex(t => t.address === tokenOut);
    if (wantedIndex === -1) {
      throw new Error('Token not found in pool');
    }
    const minAmountsOut = this.config.tokens.map(t =>
      t.address === tokenOut ? amountOutMin : BIG_ZERO
    );

    const userData: ExitPoolUserData = {
      kind: PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
      kindValue: this.getExitKindValue(PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT),
      bptAmountIn: liquidityIn,
      exitTokenIndex: wantedIndex,
    };

    return this.getRemoveLiquidityZapWithUserData(minAmountsOut, from, insertBalance, userData);
  }
}
