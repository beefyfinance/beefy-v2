import type { IBalancerPool } from '../types';
import type { ChainEntity } from '../../../../entities/chain';
import type {
  PoolConfig,
  QueryExitPoolRequest,
  QueryExitPoolResponse,
  QueryJoinPoolRequest,
  QueryJoinPoolResponse,
  VaultConfig,
} from '../vault/types';
import { createFactory } from '../../../../utils/factory-utils';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import { getWeb3Instance } from '../../../instances';
import { BalancerGyroEPoolAbi } from '../../../../../../config/abi/BalancerGyroEPoolAbi';
import type { RatesResult } from './types';
import BigNumber from 'bignumber.js';
import { Vault } from '../vault/Vault';
import {
  BIG_ONE,
  BIG_ZERO,
  bigNumberToStringDeep,
  bigNumberToUint256String,
} from '../../../../../../helpers/big-number';
import { WeightedPoolEncoder } from '../weighted/WeightedPoolEncoder';
import { GyroFixedPoint } from './GyroFixedPoint';
import type { ZapStep } from '../../../transact/zap/types';
import { checkAddressOrder } from '../../../../../../helpers/tokens';

export class GyroEPool implements IBalancerPool {
  public readonly type = 'balancer';

  constructor(
    protected readonly chain: ChainEntity,
    protected readonly vaultConfig: VaultConfig,
    protected readonly config: PoolConfig
  ) {
    checkAddressOrder(config.tokens.map(t => t.address));
  }

  // async getSwapRatioLikeStrategy(): Promise<BigNumber> {
  //   const balances = await this.getCachedBalances();
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

  async getSwapRatio(): Promise<BigNumber> {
    const upscaledBalances = await this.getCachedUpscaledBalances();
    return upscaledBalances[0].dividedBy(upscaledBalances[0].plus(upscaledBalances[1]));
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
    const upscaledBalances = await this.getCachedUpscaledBalances();
    const upscaledAmountsIn = await this.upscaleAmounts(amountsIn);

    // locally estimate how much liquidity will be added for the given input amounts
    const initialEstimatedLiquidity = BigNumber.min(
      ...upscaledAmountsIn.map((amount, i) => {
        return GyroFixedPoint.divDown(
          GyroFixedPoint.mulDown(amount, totalSupply),
          upscaledBalances[i]
        );
      })
    );
    if (initialEstimatedLiquidity.lte(BIG_ONE)) {
      // Some Gyro math requires > 1
      throw new Error('Liquidity added must be greater than 1');
    }

    const upscaledUsedInput = [...upscaledAmountsIn];
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
      for (let i = 0; i < upscaledUsedInput.length; i++) {
        upscaledUsedInput[i] = GyroFixedPoint.divUp(
          GyroFixedPoint.mulUp(upscaledBalances[i], estimatedLiquidity),
          totalSupply
        );
      }

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

  /**
   * Gyro pools only support ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT
   */
  async quoteRemoveLiquidity(amountIn: BigNumber): Promise<QueryExitPoolResponse> {
    if (amountIn.lt(BIG_ONE)) {
      throw new Error('Input amount must be greater than 0');
    }

    const vault = this.getVault();

    const queryRequest: QueryExitPoolRequest = {
      poolId: this.config.poolId,
      request: {
        assets: this.config.tokens.map(t => t.address),
        minAmountsOut: this.config.tokens.map(() => BIG_ZERO),
        userData: WeightedPoolEncoder.exitExactBPTInForTokensOut(
          bigNumberToUint256String(amountIn)
        ),
        toInternalBalance: false,
      },
    };

    return await vault.queryExitPool(queryRequest);
  }

  /**
   * Gyro pools only support ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT
   */
  async getRemoveLiquidityZap(
    amountIn: BigNumber,
    minAmountsOut: BigNumber[],
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep> {
    const vault = this.getVault();

    return vault.getExitPoolZap({
      exit: {
        poolId: this.config.poolId,
        sender: from,
        recipient: from,
        request: {
          assets: this.config.tokens.map(t => t.address),
          minAmountsOut,
          userData: WeightedPoolEncoder.exitExactBPTInForTokensOut(
            bigNumberToUint256String(amountIn)
          ),
          toInternalBalance: false,
        },
      },
      poolAddress: this.config.poolAddress,
      insertBalance,
    });
  }

  protected getDecimalScalingFactors = createFactory(() => {
    return this.config.tokens.map(token => {
      if (token.address === this.config.poolAddress) {
        return GyroFixedPoint.ONE;
      }

      if (token.decimals > 18) {
        throw new Error('Tokens with more than 18 decimals are not supported.');
      }

      const diff = 18 - token.decimals;
      return GyroFixedPoint.ONE.shiftedBy(diff);
    });
  });

  protected getCachedScalingFactors = createFactory(async () => {
    const factors = this.getDecimalScalingFactors();
    const rates = await this.getCachedTokenRates();
    return factors.map((factor, i) => GyroFixedPoint.mulDown(factor, rates[i]));
  });

  protected async upscaleAmounts(balances: BigNumber[]): Promise<BigNumber[]> {
    const factors = await this.getCachedScalingFactors();
    return balances.map((balance, i) => GyroFixedPoint.mulDown(balance, factors[i]));
  }

  protected async downscaleAmounts(amounts: BigNumber[]): Promise<BigNumber[]> {
    const factors = await this.getCachedScalingFactors();
    return amounts.map((amount, i) => GyroFixedPoint.divUp(amount, factors[i]));
  }

  protected getCachedPoolTokens = createFactory(async () => {
    const vault = this.getVault();
    return await vault.getPoolTokens(this.config.poolId);
  });

  protected getCachedBalances = createFactory(async () => {
    const poolTokens = await this.getCachedPoolTokens();
    return poolTokens.map(t => t.balance);
  });

  protected getCachedUpscaledBalances = createFactory(async () => {
    return await this.upscaleAmounts(await this.getCachedBalances());
  });

  protected getCachedTotalSupply = createFactory(async () => {
    return this.getTotalSupply();
  });

  protected async getTotalSupply(): Promise<BigNumber> {
    const pool = await this.getPoolContract();
    const totalSupply: string = await pool.methods.getActualSupply().call();
    return new BigNumber(totalSupply);
  }

  protected getCachedTokenRates = createFactory(async () => {
    return this.getTokenRates();
  });

  protected async getTokenRates(): Promise<BigNumber[]> {
    const pool = await this.getPoolContract();
    const rates: RatesResult = await pool.methods.getTokenRates().call();
    return [rates.rate0, rates.rate1].map(rate => new BigNumber(rate));
  }

  protected getWeb3 = createFactory(() => getWeb3Instance(this.chain));

  protected getPoolContract = createFactory(async () => {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerGyroEPoolAbi), this.config.poolAddress);
  });

  protected getVault = createFactory(() => {
    return new Vault(this.chain, this.vaultConfig);
  });
}
