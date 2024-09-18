import type { IBalancerJoinPool } from '../types';
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
import type { NormalizedWeightsResult } from './types';
import type BigNumber from 'bignumber.js';
import { Vault } from '../vault/Vault';
import {
  BIG_ONE,
  BIG_ZERO,
  bigNumberToStringDeep,
  bigNumberToUint256String,
  fromWeiString,
} from '../../../../../../helpers/big-number';
import { WeightedPoolEncoder } from './WeightedPoolEncoder';
import { FixedPoint } from './FixedPoint';
import type { ZapStep } from '../../../transact/zap/types';
import { checkAddressOrder } from '../../../../../../helpers/tokens';
import { BalancerWeightedPoolAbi } from '../../../../../../config/abi/BalancerWeightedPoolAbi';

export class WeightedPool implements IBalancerJoinPool {
  public readonly type = 'balancer';
  public readonly subType = 'join';

  constructor(
    protected readonly chain: ChainEntity,
    protected readonly vaultConfig: VaultConfig,
    protected readonly config: PoolConfig
  ) {
    checkAddressOrder(config.tokens.map(t => t.address));

    this.getSwapRatios = this.cacheMethod(this.getSwapRatios);
    this.getScalingFactors = this.cacheMethod(this.getScalingFactors);
    this.getPoolTokens = this.cacheMethod(this.getPoolTokens);
    this.getBalances = this.cacheMethod(this.getBalances);
    this.getNormalizedWeights = this.cacheMethod(this.getNormalizedWeights);
    this.getWeb3 = this.cacheMethod(this.getWeb3);
    this.getPoolContract = this.cacheMethod(this.getPoolContract);
    this.getVault = this.cacheMethod(this.getVault);
  }

  protected cacheMethod<T extends (...args: unknown[]) => unknown>(fn: T): T {
    return createFactory(fn.bind(this)) as T;
  }

  get joinSupportsSlippage() {
    return true;
  }

  async getSwapRatios(): Promise<BigNumber[]> {
    return this.getNormalizedWeights();
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
        request: {
          assets: this.config.tokens.map(t => t.address),
          maxAmountsIn: amountsIn,
          userData: WeightedPoolEncoder.joinExactTokensInForBPTOut(
            amountsIn.map(amount => bigNumberToUint256String(amount)),
            bigNumberToUint256String(minLiquidity)
          ),
          fromInternalBalance: false,
        },
      },
      insertBalance,
    });
  }

  async quoteAddLiquidity(amountsIn: BigNumber[]): Promise<QueryJoinPoolResponse> {
    if (amountsIn.every(amount => amount.lte(BIG_ZERO))) {
      throw new Error('At least one input amount must be greater than 0');
    }

    const vault = this.getVault();
    const queryRequest: QueryJoinPoolRequest = {
      poolId: this.config.poolId,
      request: {
        assets: this.config.tokens.map(t => t.address),
        maxAmountsIn: amountsIn,
        userData: WeightedPoolEncoder.joinExactTokensInForBPTOut(
          amountsIn.map(amount => bigNumberToUint256String(amount)),
          '0'
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

    return {
      liquidity: queryResult.liquidity,
      usedInput: queryResult.usedInput,
      unusedInput: amountsIn.map((amount, i) => amount.minus(queryResult.usedInput[i])),
    };
  }

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

  protected async getScalingFactors() {
    return this.config.tokens.map(token => {
      if (token.address === this.config.poolAddress) {
        return FixedPoint.ONE;
      }

      if (token.decimals > 18) {
        throw new Error('Tokens with more than 18 decimals are not supported.');
      }

      const diff = 18 - token.decimals;
      return FixedPoint.ONE.shiftedBy(diff);
    });
  }

  protected async upscaleAmounts(balances: BigNumber[]): Promise<BigNumber[]> {
    const factors = await this.getScalingFactors();
    return balances.map((balance, i) => FixedPoint.mulDown(balance, factors[i]));
  }

  protected async downscaleAmounts(amounts: BigNumber[]): Promise<BigNumber[]> {
    const factors = await this.getScalingFactors();
    return amounts.map((amount, i) => FixedPoint.divUp(amount, factors[i]));
  }

  protected async getPoolTokens() {
    const vault = this.getVault();
    return await vault.getPoolTokens(this.config.poolId);
  }

  protected async getBalances() {
    const poolTokens = await this.getPoolTokens();
    return poolTokens.map(t => t.balance);
  }

  protected async getNormalizedWeights(): Promise<BigNumber[]> {
    const pool = await this.getPoolContract();
    const weights: NormalizedWeightsResult = await pool.methods.getNormalizedWeights().call();
    return weights.map(weight => fromWeiString(weight, 18));
  }

  protected async getWeb3() {
    return getWeb3Instance(this.chain);
  }

  protected async getPoolContract() {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerWeightedPoolAbi), this.config.poolAddress);
  }

  protected getVault() {
    return new Vault(this.chain, this.vaultConfig);
  }
}
