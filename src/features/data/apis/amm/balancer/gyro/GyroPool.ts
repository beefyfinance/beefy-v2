import type {
  PoolConfig,
  QueryJoinPoolRequest,
  QueryJoinPoolResponse,
  VaultConfig,
} from '../vault/types.ts';
import BigNumber from 'bignumber.js';
import { BIG_ONE, bigNumberToStringDeep } from '../../../../../../helpers/big-number.ts';
import { FixedPoint } from '../common/FixedPoint.ts';
import type { ZapStep } from '../../../transact/zap/types.ts';
import { WeightedMath } from '../weighted/WeightedMath.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import { BalancerGyroEPoolAbi } from '../../../../../../config/abi/BalancerGyroEPoolAbi.ts';
import { AllPool } from '../common/AllPool.ts';
import { BalancerFeature, type IBalancerAllPool } from '../types.ts';
import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import {
  poolExitKindToGyroPoolExitKind,
  poolJoinKindToGyroPoolJoinKind,
} from './join-exit-kinds.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';

const SUPPORTED_FEATURES = new Set<BalancerFeature>([
  BalancerFeature.AddRemoveAll,
  // BalancerFeature.AddRemoveSingle, // Gyro pools only support JoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT / ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT
  // BalancerFeature.AddSlippage,
  BalancerFeature.RemoveSlippage,
]);

// Covers Gyro and GyroE
export class GyroPool extends AllPool implements IBalancerAllPool {
  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getTokenRates = this.cacheMethod(this.getTokenRates);
    this.getActualSupply = this.cacheMethod(this.getActualSupply);
  }

  supportsFeature(feature: BalancerFeature): boolean {
    return SUPPORTED_FEATURES.has(feature);
  }

  protected getJoinKindValue(kind: PoolJoinKind): number {
    const value = poolJoinKindToGyroPoolJoinKind[kind];
    if (value === undefined) {
      throw new Error(`GyroPool does not support join kind ${PoolJoinKind[kind]}`);
    }
    return value;
  }

  protected getExitKindValue(kind: PoolExitKind): number {
    const value = poolExitKindToGyroPoolExitKind[kind];
    if (value === undefined) {
      throw new Error(`GyroPool does not support join kind ${PoolExitKind[kind]}`);
    }
    return value;
  }

  /**
   * The ratio of balances[n] * scaling factor[n] * token rate[n] over their sum
   */
  async getSwapRatios(): Promise<BigNumber[]> {
    const upscaledBalances = await this.getUpscaledBalances();
    const token0Ratio = upscaledBalances[0].dividedBy(
      upscaledBalances[0].plus(upscaledBalances[1])
    );
    return [token0Ratio, BIG_ONE.minus(token0Ratio)];
  }

  /**
   * Gyro pools only support JoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT
   */
  async getAddLiquidityZap(
    maxAmountsIn: BigNumber[],
    liquidity: BigNumber,
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
          maxAmountsIn: maxAmountsIn,
          userData: {
            kind: PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
            kindValue: this.getJoinKindValue(PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT),
            bptAmountOut: liquidity,
          },
          fromInternalBalance: false,
        }),
      },
      insertBalance,
    });
  }

  /**
   * Gyro pools only support JoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT
   * Which makes it hard to estimate how much liquidity will be added for the given input amounts
   */
  async quoteAddLiquidity(amountsIn: BigNumber[]): Promise<QueryJoinPoolResponse> {
    if (amountsIn.some(amount => amount.lte(BIG_ONE))) {
      throw new Error('Input amounts must be greater than 1');
    }

    const vault = this.getVault();
    // We must call getActualSupply instead of totalSupply to get the real supply after fees have been collected
    const totalSupply = await this.getActualSupply();
    if (totalSupply.isZero()) {
      throw new Error('Actual supply is zero');
    }

    // all on-chain calculations are done with upscaled balances in FixedPoint (18 decimals)
    const upscaledBalances = await this.getUpscaledBalances();
    const upscaledAmountsIn = await this.upscaleAmounts(amountsIn);

    // locally estimate how much liquidity will be added for the given input amounts
    // inverse of WeightedMath.calcAllTokensInGivenExactBptOut
    const initialEstimatedLiquidity = BigNumber.min(
      ...upscaledAmountsIn.map((amount, i) =>
        // bptOut = tokenIn[n] * totalSupply / balances[n]
        FixedPoint.divDown(FixedPoint.mulDown(amount, totalSupply), upscaledBalances[i])
      )
    );
    if (initialEstimatedLiquidity.lte(BIG_ONE)) {
      // Some Gyro math requires > 1
      throw new Error('Liquidity added must be greater than 1');
    }

    let upscaledUsedInput = [...upscaledAmountsIn];
    let estimatedLiquidity = initialEstimatedLiquidity;
    do {
      console.debug(
        'local check',
        bigNumberToStringDeep({
          liquidity: estimatedLiquidity,
          upscaledUsedInput,
          upscaledBalances,
          totalSupply,
        })
      );

      // locally estimate how much of each input amount will be used to add the given liquidity
      upscaledUsedInput = WeightedMath.calcAllTokensInGivenExactBptOut(
        upscaledBalances,
        estimatedLiquidity,
        totalSupply
      );

      if (upscaledUsedInput.some(amount => amount.lte(BIG_ONE))) {
        // Some Gyro math requires > 1
        throw new Error('Failed to calculate liquidity');
      }

      // if the estimated used input amounts are less than or equal to the actual input amounts, we can ask for this much liquidity
      if (upscaledUsedInput.every((amount, i) => amount.lte(upscaledAmountsIn[i]))) {
        // double check via rpc call
        const queryRequest: QueryJoinPoolRequest = {
          poolId: this.config.poolId,
          request: this.customizeJoinPoolRequest({
            assets: this.config.tokens.map(t => t.address),
            maxAmountsIn: amountsIn,
            userData: {
              kind: PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
              kindValue: this.getJoinKindValue(PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT),
              bptAmountOut: estimatedLiquidity,
            },
            fromInternalBalance: false,
          }),
        };
        const queryResult = await vault.queryJoinPool(queryRequest);
        console.debug(
          'queryJoinPool',
          bigNumberToStringDeep(queryRequest),
          bigNumberToStringDeep(queryResult)
        );

        // if on-chain result is consistent with local estimate, return the result
        if (queryResult.usedInput.every((amount, i) => amount.lte(amountsIn[i]))) {
          return {
            liquidity: queryResult.liquidity,
            usedInput: queryResult.usedInput,
            unusedInput: amountsIn.map((amount, i) => amount.minus(queryResult.usedInput[i])),
          };
        }
      }

      // next time try with 1 less liquidity
      estimatedLiquidity = estimatedLiquidity.minus(BIG_ONE);
    } while (estimatedLiquidity.gt(BIG_ONE));

    throw new Error('Failed to calculate liquidity');
  }

  /**
   * Internally gyro pools use a scaling factor that includes the token rate too
   */
  protected async getScalingFactors() {
    const factors = await super.getScalingFactors();
    const rates = await this.getTokenRates();
    return factors.map((factor, i) => FixedPoint.mulDown(factor, rates[i]));
  }

  protected async getTokenRates(): Promise<BigNumber[]> {
    const pool = this.getPoolContract();
    const rates = await pool.read.getTokenRates();
    return rates.map(rate => new BigNumber(rate.toString(10)));
  }

  protected getPoolContract() {
    return fetchContract(this.config.poolAddress, BalancerGyroEPoolAbi, this.chain.id);
  }

  protected async getActualSupply(): Promise<BigNumber> {
    const pool = this.getPoolContract();
    const totalSupply = await pool.read.getActualSupply();
    return new BigNumber(totalSupply.toString(10));
  }
}
