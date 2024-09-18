import type {
  PoolConfig,
  QueryJoinPoolRequest,
  QueryJoinPoolResponse,
  VaultConfig,
} from '../vault/types';
import type { RatesResult } from './types';
import BigNumber from 'bignumber.js';
import {
  BIG_ONE,
  bigNumberToStringDeep,
  bigNumberToUint256String,
} from '../../../../../../helpers/big-number';
import { WeightedPoolEncoder } from '../weighted/WeightedPoolEncoder';
import { FixedPoint } from '../weighted/FixedPoint';
import type { ZapStep } from '../../../transact/zap/types';
import { WeightedMath } from '../weighted/WeightedMath';
import { WeightedPool } from '../weighted/WeightedPool';
import type { ChainEntity } from '../../../../entities/chain';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import { BalancerGyroEPoolAbi } from '../../../../../../config/abi/BalancerGyroEPoolAbi';

export class GyroEPool extends WeightedPool {
  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getUpscaledBalances = this.cacheMethod(this.getUpscaledBalances);
    this.getTokenRates = this.cacheMethod(this.getTokenRates);
    this.getTotalSupply = this.cacheMethod(this.getTotalSupply);
  }

  get joinSupportsSlippage() {
    return false;
  }

  // async getSwapRatioLikeStrategy(): Promise<BigNumber> {
  //   const balances = await this.getBalances();
  //   const rates = await this.getTokenRates();
  //   const totalSupply = await this.getTotalSupply();
  //   if (balances.length !== this.config.tokens.length || rates.length !== this.config.tokens.length) {
  //     throw new Error('Invalid tokens / rates');
  //   }
  //
  //   const amount0 = balances[0].shiftedBy(18).dividedToIntegerBy(totalSupply);
  //   const amount1 = balances[1].shiftedBy(18).dividedToIntegerBy(totalSupply);
  //   const ratio = rates[0]
  //     .shiftedBy(18)
  //     .dividedToIntegerBy(rates[1])
  //     .multipliedBy(amount1)
  //     .dividedToIntegerBy(amount0);
  //
  //   return BIG_ONE.shiftedBy(18).dividedBy(ratio.plus(BIG_ONE.shiftedBy(18)));
  // }

  /** assumption: all gyro pools have rateProviders */
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
        request: {
          assets: this.config.tokens.map(t => t.address),
          maxAmountsIn: maxAmountsIn,
          userData: WeightedPoolEncoder.joinAllTokensInForExactBPTOut(
            bigNumberToUint256String(liquidity)
          ),
          fromInternalBalance: false,
        },
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
    const totalSupply = await this.getTotalSupply();
    if (totalSupply.isZero()) {
      throw new Error('Total supply is zero');
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
          request: {
            assets: this.config.tokens.map(t => t.address),
            maxAmountsIn: amountsIn,
            userData: WeightedPoolEncoder.joinAllTokensInForExactBPTOut(
              bigNumberToUint256String(estimatedLiquidity)
            ),
            fromInternalBalance: false,
          },
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

  protected async getScalingFactors() {
    const factors = await super.getScalingFactors();
    const rates = await this.getTokenRates();
    return factors.map((factor, i) => FixedPoint.mulDown(factor, rates[i]));
  }

  protected async getUpscaledBalances() {
    return await this.upscaleAmounts(await this.getBalances());
  }

  protected async getTokenRates(): Promise<BigNumber[]> {
    const pool = await this.getPoolContract();
    const rates: RatesResult = await pool.methods.getTokenRates().call();
    return [rates.rate0, rates.rate1].map(rate => new BigNumber(rate));
  }

  protected async getTotalSupply(): Promise<BigNumber> {
    const pool = await this.getPoolContract();
    const totalSupply: string = await pool.methods.getActualSupply().call();
    return new BigNumber(totalSupply);
  }

  protected async getPoolContract() {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerGyroEPoolAbi), this.config.poolAddress);
  }
}
