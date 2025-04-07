import type { BalancerFeature, IBalancerPool } from '../types.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { PoolConfig, VaultConfig } from '../vault/types.ts';
import { createFactory } from '../../../../utils/factory-utils.ts';
import { Vault } from '../vault/Vault.ts';
import { checkAddressOrder } from '../../../../../../helpers/tokens.ts';
import type BigNumber from 'bignumber.js';
import { FixedPoint } from './FixedPoint.ts';
import type { GetContractReturnType } from 'viem';

export abstract class CommonPool implements IBalancerPool {
  public readonly type = 'balancer';

  protected constructor(
    protected readonly chain: ChainEntity,
    protected readonly vaultConfig: VaultConfig,
    protected readonly config: PoolConfig
  ) {
    checkAddressOrder(config.tokens.map(t => t.address));

    this.getScalingFactors = this.cacheMethod(this.getScalingFactors);
    this.getPoolTokens = this.cacheMethod(this.getPoolTokens);
    this.getBalances = this.cacheMethod(this.getBalances);
    this.getUpscaledBalances = this.cacheMethod(this.getUpscaledBalances);
    this.getPoolContract = this.cacheMethod(this.getPoolContract);
    this.getVault = this.cacheMethod(this.getVault);
  }

  abstract supportsFeature(feature: BalancerFeature): boolean;

  protected abstract getPoolContract(): GetContractReturnType;

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

  protected getVault() {
    return new Vault(this.chain, this.vaultConfig);
  }

  protected cacheMethod<T extends (...args: unknown[]) => unknown>(fn: T): T {
    return createFactory(fn.bind(this)) as T;
  }
}
