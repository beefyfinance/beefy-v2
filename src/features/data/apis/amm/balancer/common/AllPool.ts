import type { BalancerFeature, IBalancerAllPool } from '../types.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type {
  ExitPoolRequest,
  JoinPoolRequest,
  PoolConfig,
  QueryExitPoolRequest,
  QueryExitPoolResponse,
  QueryJoinPoolRequest,
  QueryJoinPoolResponse,
  VaultConfig,
} from '../vault/types.ts';
import { BIG_ONE, BIG_ZERO, bigNumberToStringDeep } from '../../../../../../helpers/big-number.ts';
import type { ZapStep } from '../../../transact/zap/types.ts';
import type BigNumber from 'bignumber.js';
import { CommonPool } from './CommonPool.ts';
import {
  type ExitPoolUserData,
  type JoinPoolUserData,
  PoolExitKind,
  PoolJoinKind,
} from './types.ts';
import type { GetContractReturnType } from 'viem';

/** Join/Exit with all tokens in ratio */
export abstract class AllPool extends CommonPool implements IBalancerAllPool {
  protected constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getSwapRatios = this.cacheMethod(this.getSwapRatios);
  }

  abstract supportsFeature(feature: BalancerFeature): boolean;

  abstract getSwapRatios(): Promise<BigNumber[]>;

  protected abstract getPoolContract(): GetContractReturnType;

  protected abstract getJoinKindValue(kind: PoolJoinKind): number;

  protected abstract getExitKindValue(kind: PoolExitKind): number;

  protected customizeJoinPoolRequest(
    request: JoinPoolRequest<JoinPoolUserData>
  ): JoinPoolRequest<JoinPoolUserData> {
    return request;
  }

  protected customizeExitPoolRequest(
    request: ExitPoolRequest<ExitPoolUserData>
  ): ExitPoolRequest<ExitPoolUserData> {
    return request;
  }

  protected customizeQueryJoinPoolResponse(response: QueryJoinPoolResponse): QueryJoinPoolResponse {
    return response;
  }

  protected customizeQueryExitPoolResponse(response: QueryExitPoolResponse): QueryExitPoolResponse {
    return response;
  }

  async quoteAddLiquidity(amountsIn: BigNumber[]): Promise<QueryJoinPoolResponse> {
    if (amountsIn.every(amount => amount.lte(BIG_ZERO))) {
      throw new Error('At least one input amount must be greater than 0');
    }

    const vault = this.getVault();
    const queryRequest: QueryJoinPoolRequest = {
      poolId: this.config.poolId,
      request: this.customizeJoinPoolRequest({
        assets: this.config.tokens.map(t => t.address),
        maxAmountsIn: amountsIn,
        userData: {
          kind: PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
          kindValue: this.getJoinKindValue(PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT),
          amountsIn,
          tokensIn: this.config.tokens.map(t => t.address),
          minimumBPT: BIG_ZERO,
        },
        fromInternalBalance: false,
      }),
    };
    console.debug('quoteAddLiquidity#request', bigNumberToStringDeep(queryRequest));
    const queryResult = this.customizeQueryJoinPoolResponse(
      await vault.queryJoinPool(queryRequest)
    );
    console.debug('quoteAddLiquidity#result', bigNumberToStringDeep(queryResult));

    return queryResult;
  }

  async getAddLiquidityZap(
    amountsIn: BigNumber[],
    minLiquidity: BigNumber,
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep> {
    const vault = this.getVault();

    return vault.getJoinPoolZap({
      join: {
        poolId: this.config.poolId,
        sender: from,
        recipient: from,
        request: this.customizeJoinPoolRequest({
          assets: this.config.tokens.map(t => t.address),
          maxAmountsIn: amountsIn,
          userData: {
            kind: PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
            kindValue: this.getJoinKindValue(PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT),
            amountsIn,
            tokensIn: this.config.tokens.map(t => t.address),
            minimumBPT: minLiquidity,
          },
          fromInternalBalance: false,
        }),
      },
      insertBalance,
    });
  }

  async quoteRemoveLiquidity(liquidityIn: BigNumber): Promise<QueryExitPoolResponse> {
    const userData: ExitPoolUserData = {
      kind: PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT,
      kindValue: this.getExitKindValue(PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT),
      bptAmountIn: liquidityIn,
    };

    return this.quoteRemoveLiquidityWithUserData(liquidityIn, userData);
  }

  protected async quoteRemoveLiquidityWithUserData(
    liquidityIn: BigNumber,
    userData: ExitPoolUserData
  ): Promise<QueryExitPoolResponse> {
    if (liquidityIn.lt(BIG_ONE)) {
      throw new Error('liquidityIn must be greater than 0');
    }

    const vault = this.getVault();
    const queryRequest: QueryExitPoolRequest = {
      poolId: this.config.poolId,
      request: this.customizeExitPoolRequest({
        assets: this.config.tokens.map(t => t.address),
        minAmountsOut: this.config.tokens.map(() => BIG_ZERO),
        userData,
        toInternalBalance: false,
      }),
    };
    console.debug('quoteRemoveLiquidity#request', bigNumberToStringDeep(queryRequest));
    const result = this.customizeQueryExitPoolResponse(await vault.queryExitPool(queryRequest));
    console.debug('quoteRemoveLiquidity#result', bigNumberToStringDeep(result));
    return result;
  }

  async getRemoveLiquidityZap(
    liquidityIn: BigNumber,
    minAmountsOut: BigNumber[],
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep> {
    return this.getRemoveLiquidityZapWithUserData(minAmountsOut, from, insertBalance, {
      kind: PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT,
      kindValue: this.getExitKindValue(PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT),
      bptAmountIn: liquidityIn,
    });
  }

  protected async getRemoveLiquidityZapWithUserData(
    minAmountsOut: BigNumber[],
    from: string,
    insertBalance: boolean,
    userData: ExitPoolUserData
  ): Promise<ZapStep> {
    const vault = this.getVault();

    return vault.getExitPoolZap({
      exit: {
        poolId: this.config.poolId,
        sender: from,
        recipient: from,
        request: this.customizeExitPoolRequest({
          assets: this.config.tokens.map(t => t.address),
          minAmountsOut,
          userData,
          toInternalBalance: false,
        }),
      },
      poolAddress: this.config.poolAddress,
      insertBalance,
    });
  }
}
