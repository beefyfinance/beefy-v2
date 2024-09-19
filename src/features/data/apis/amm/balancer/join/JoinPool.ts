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
import { getWeb3Instance } from '../../../instances';
import { Vault } from '../vault/Vault';
import {
  BIG_ONE,
  BIG_ZERO,
  bigNumberToStringDeep,
  bigNumberToUint256String,
} from '../../../../../../helpers/big-number';
import type { ZapStep } from '../../../transact/zap/types';
import { checkAddressOrder } from '../../../../../../helpers/tokens';
import type { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { JoinExitEncoder } from './JoinExitEncoder';
import { FixedPoint } from './FixedPoint';

export abstract class JoinPool implements IBalancerJoinPool {
  public readonly type = 'balancer';
  public readonly subType = 'join';

  protected constructor(
    protected readonly chain: ChainEntity,
    protected readonly vaultConfig: VaultConfig,
    protected readonly config: PoolConfig
  ) {
    checkAddressOrder(config.tokens.map(t => t.address));

    this.getSwapRatios = this.cacheMethod(this.getSwapRatios);
    this.getScalingFactors = this.cacheMethod(this.getScalingFactors);
    this.getPoolTokens = this.cacheMethod(this.getPoolTokens);
    this.getBalances = this.cacheMethod(this.getBalances);
    this.getUpscaledBalances = this.cacheMethod(this.getUpscaledBalances);
    this.getTotalSupply = this.cacheMethod(this.getTotalSupply);
    this.getWeb3 = this.cacheMethod(this.getWeb3);
    this.getPoolContract = this.cacheMethod(this.getPoolContract);
    this.getVault = this.cacheMethod(this.getVault);
  }

  abstract get joinSupportsSlippage(): boolean;

  abstract getSwapRatios(): Promise<BigNumber[]>;

  protected abstract getPoolContract(): Promise<Contract>;

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
          userData: JoinExitEncoder.joinExactTokensInForBPTOut(
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
        userData: JoinExitEncoder.joinExactTokensInForBPTOut(
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
        userData: JoinExitEncoder.exitExactBPTInForTokensOut(bigNumberToUint256String(amountIn)),
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
          userData: JoinExitEncoder.exitExactBPTInForTokensOut(bigNumberToUint256String(amountIn)),
          toInternalBalance: false,
        },
      },
      poolAddress: this.config.poolAddress,
      insertBalance,
    });
  }

  /**
   * Multiplier to normalize to 18 decimals
   */
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

  protected async getUpscaledBalances() {
    return await this.upscaleAmounts(await this.getBalances());
  }

  protected async getTotalSupply(): Promise<BigNumber> {
    const pool = await this.getPoolContract();
    const totalSupply: string = await pool.methods.getActualSupply().call();
    return new BigNumber(totalSupply);
  }

  protected async getWeb3() {
    return getWeb3Instance(this.chain);
  }

  protected getVault() {
    return new Vault(this.chain, this.vaultConfig);
  }

  protected cacheMethod<T extends (...args: unknown[]) => unknown>(fn: T): T {
    return createFactory(fn.bind(this)) as T;
  }
}
