import type { BalancerFeature, IBalancerPool } from '../types';
import type { ChainEntity } from '../../../../entities/chain';
import type { PoolConfig, VaultConfig } from '../vault/types';
import { Vault } from '../vault/Vault';
import type BigNumber from 'bignumber.js';
import type { GetContractReturnType } from 'viem';
export declare abstract class CommonPool implements IBalancerPool {
    protected readonly chain: ChainEntity;
    protected readonly vaultConfig: VaultConfig;
    protected readonly config: PoolConfig;
    readonly type = "balancer";
    protected constructor(chain: ChainEntity, vaultConfig: VaultConfig, config: PoolConfig);
    abstract supportsFeature(feature: BalancerFeature): boolean;
    protected abstract getPoolContract(): GetContractReturnType;
    /**
     * Multiplier to normalize to 18 decimals
     */
    protected getScalingFactors(): Promise<BigNumber[]>;
    protected upscaleAmounts(balances: BigNumber[]): Promise<BigNumber[]>;
    protected downscaleAmounts(amounts: BigNumber[]): Promise<BigNumber[]>;
    protected getPoolTokens(): Promise<import("../vault/types").PoolTokensResponse>;
    protected getBalances(): Promise<BigNumber[]>;
    protected getUpscaledBalances(): Promise<BigNumber[]>;
    protected getVault(): Vault;
    protected cacheMethod<T extends (...args: unknown[]) => unknown>(fn: T): T;
}
