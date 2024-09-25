import { BalancerFeature, type IBalancerAllPool, type IBalancerSinglePool } from '../types';
import BigNumber from 'bignumber.js';
import { BIG_ZERO, fromWei } from '../../../../../../helpers/big-number';
import type { ChainEntity } from '../../../../entities/chain';
import {
  type ExitPoolRequest,
  type JoinPoolRequest,
  type PoolConfig,
  type QueryExitPoolResponse,
  type QueryJoinPoolResponse,
  type VaultConfig,
} from '../vault/types';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import { BalancerComposableStablePoolAbi } from '../../../../../../config/abi/BalancerComposableStablePoolAbi';
import { FixedPoint } from '../common/FixedPoint';
import {
  type ExitPoolUserData,
  type JoinPoolUserData,
  PoolExitKind,
  PoolJoinKind,
} from '../common/types';
import {
  poolExitKindToComposableStablePoolExitKind,
  poolJoinKindToComposableStablePoolJoinKind,
} from './join-exit-kinds';
import { SingleAllPool } from '../common/SingleAllPool';

const SUPPORTED_FEATURES = new Set<BalancerFeature>([
  BalancerFeature.AddRemoveAll,
  BalancerFeature.AddRemoveSingle,
  BalancerFeature.AddSlippage,
  BalancerFeature.RemoveSlippage,
]);

export class ComposableStablePool
  extends SingleAllPool
  implements IBalancerSinglePool, IBalancerAllPool
{
  public readonly type = 'balancer';

  protected readonly bptIndex: number;

  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);
    if (config.bptIndex === undefined) {
      throw new Error('BPT index is required for composable stable pools');
    }
  }

  supportsFeature(feature: BalancerFeature): boolean {
    return SUPPORTED_FEATURES.has(feature);
  }

  protected getJoinKindValue(kind: PoolJoinKind): number {
    const value = poolJoinKindToComposableStablePoolJoinKind[kind];
    if (value === undefined) {
      throw new Error(`ComposableStablePool does not support join kind ${PoolJoinKind[kind]}`);
    }
    return value;
  }

  protected getExitKindValue(kind: PoolExitKind): number {
    const value = poolExitKindToComposableStablePoolExitKind[kind];
    if (value === undefined) {
      throw new Error(`ComposableStablePool does not support join kind ${PoolExitKind[kind]}`);
    }
    return value;
  }

  /**
   * The ratio of balances[n] * scaling factor[n] * token rate[n] over their sum
   */
  async getSwapRatios(): Promise<BigNumber[]> {
    const upscaledBalances = this.dropBptIndex(await this.getUpscaledBalances());
    const totalUpscaledBalance = upscaledBalances.reduce((acc, b) => acc.plus(b), BIG_ZERO);
    const lastIndex = upscaledBalances.length - 1;
    const ratios = upscaledBalances.map((b, i) =>
      i === lastIndex ? BIG_ZERO : FixedPoint.divDown(b, totalUpscaledBalance)
    );
    ratios[lastIndex] = FixedPoint.ONE.minus(ratios.reduce((acc, w) => acc.plus(w), BIG_ZERO));
    return ratios.map(r => fromWei(r, 18));
  }

  protected customizeJoinPoolRequest(
    request: JoinPoolRequest<JoinPoolUserData>
  ): JoinPoolRequest<JoinPoolUserData> {
    // Add BPT token to request
    request.assets = this.insertBptIndex(request.assets, this.config.poolAddress);
    request.maxAmountsIn = this.insertBptIndex(request.maxAmountsIn, BIG_ZERO);
    return request;
  }

  protected customizeQueryJoinPoolResponse(response: QueryJoinPoolResponse): QueryJoinPoolResponse {
    // Remove BPT token from the response
    response.usedInput = this.dropBptIndex(response.usedInput);
    response.unusedInput = this.dropBptIndex(response.unusedInput);
    return response;
  }

  protected customizeExitPoolRequest(
    request: ExitPoolRequest<ExitPoolUserData>
  ): ExitPoolRequest<ExitPoolUserData> {
    // Add BPT token to request
    request.assets = this.insertBptIndex(request.assets, this.config.poolAddress);
    request.minAmountsOut = this.insertBptIndex(request.minAmountsOut, BIG_ZERO);
    return request;
  }

  protected customizeQueryExitPoolResponse(response: QueryExitPoolResponse): QueryExitPoolResponse {
    // Remove BPT token from the response
    response.outputs = this.dropBptIndex(response.outputs);
    return response;
  }

  /*async quoteRemoveLiquidityOneToken(liquidityIn: BigNumber, tokenOut: string): Promise<BigNumber> {
    this.checkAmount(liquidityIn, 'liquidityIn');
    this.checkToken(tokenOut, 'tokenOut');

    const request: QueryBatchSwapRequest = {
      kind: SwapKind.GIVEN_IN,
      swaps: [
        {
          poolId: this.config.poolId,
          assetInIndex: 0,
          assetOutIndex: 1,
          amount: liquidityIn,
          userData: '0x',
        },
      ],
      assets: [this.config.poolAddress, tokenOut],
    };

    const vault = this.getVault();
    const [vaultInputDelta, vaultOutputDelta] = await vault.queryBatchSwap(request);

    if (!vaultInputDelta.eq(liquidityIn)) {
      throw new Error('Not all input used');
    }

    if (vaultOutputDelta.gte(BIG_ZERO)) {
      throw new Error('Output is negative');
    }

    return vaultOutputDelta.abs();
  }*/

  /*async getAddLiquidityOneTokenZap(
    amountIn: BigNumber,
    tokenIn: string,
    liquidityOutMin: BigNumber,
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep> {
    this.checkToken(tokenIn, 'tokenIn');
    this.checkAmount(amountIn, 'amountIn');
    this.checkAmount(liquidityOutMin, 'liquidityOutMin');

    const vault = this.getVault();
    return vault.getSwapZap({
      swap: {
        singleSwap: {
          poolId: this.config.poolId,
          kind: SwapKind.GIVEN_IN,
          assetIn: tokenIn,
          assetOut: this.config.poolAddress,
          amount: amountIn,
          userData: '0x',
        },
        funds: {
          sender: from,
          fromInternalBalance: false,
          recipient: from,
          toInternalBalance: false,
        },
        limit: liquidityOutMin,
        deadline: getUnixNow() + THIRTY_MINUTES_IN_SECONDS,
      },
      insertBalance,
    });
  }*/

  /*async getRemoveLiquidityOneTokenZap(
    liquidityIn: BigNumber,
    tokenOut: string,
    amountOutMin: BigNumber,
    from: string,
    insertBalance: boolean,
    deadlineSeconds: number = THIRTY_MINUTES_IN_SECONDS
  ): Promise<ZapStep> {
    this.checkToken(tokenOut, 'tokenOut');
    this.checkAmount(liquidityIn, 'liquidityIn');
    this.checkAmount(amountOutMin, 'amountOutMin');

    const vault = this.getVault();
    return vault.getSwapZap({
      swap: {
        singleSwap: {
          poolId: this.config.poolId,
          kind: SwapKind.GIVEN_IN,
          assetIn: this.config.poolAddress,
          assetOut: tokenOut,
          amount: liquidityIn,
          userData: '0x',
        },
        funds: {
          sender: from,
          fromInternalBalance: false,
          recipient: from,
          toInternalBalance: false,
        },
        limit: amountOutMin,
        deadline: getUnixNow() + deadlineSeconds,
      },
      insertBalance,
    });
  }*/

  protected dropBptIndex<T>(amounts: T[]): T[] {
    return amounts.filter((_, i) => i !== this.config.bptIndex);
  }

  protected insertBptIndex<T>(values: T[], value: T): T[] {
    const result = [...values];
    result.splice(this.config.bptIndex!, 0, value);
    return result;
  }

  /*  protected checkAmount(amount: BigNumber, label: string = 'amount') {
      if (amount.lte(BIG_ZERO)) {
        throw new Error(`${label} must be greater than 0`);
      }
  
      if ((amount.decimalPlaces() || 0) > 0) {
        throw new Error(`${label} must be in wei`);
      }
    }
  
    protected checkToken(tokenAddress: string, label: string = 'token'): number {
      const index = this.config.tokens.findIndex(t => t.address === tokenAddress);
      if (index === -1) {
        throw new Error(`${label} must be a pool token`);
      }
      return index;
    }*/

  /**
   * For composable stable pools, the scaling factors include the token rate too
   */
  protected async getScalingFactors() {
    const pool = await this.getPoolContract();
    const factors: string[] = await pool.methods.getScalingFactors().call();
    return factors.map(f => new BigNumber(f));
  }

  protected async getPoolContract() {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(
      viemToWeb3Abi(BalancerComposableStablePoolAbi),
      this.config.poolAddress
    );
  }
}
