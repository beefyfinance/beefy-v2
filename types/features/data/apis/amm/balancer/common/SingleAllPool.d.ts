import { AllPool } from './AllPool';
import type { IBalancerAllPool, IBalancerSinglePool } from '../types';
import type { ChainEntity } from '../../../../entities/chain';
import { type PoolConfig, type QueryExitPoolResponse, type QueryJoinPoolResponse, type VaultConfig } from '../vault/types';
import type BigNumber from 'bignumber.js';
import type { ZapStep } from '../../../transact/zap/types';
/** Join/Exit with one token or all tokens in ratio */
export declare abstract class SingleAllPool extends AllPool implements IBalancerSinglePool, IBalancerAllPool {
    readonly chain: ChainEntity;
    readonly vaultConfig: VaultConfig;
    readonly config: PoolConfig;
    protected constructor(chain: ChainEntity, vaultConfig: VaultConfig, config: PoolConfig);
    quoteAddLiquidityOneToken(amountIn: BigNumber, tokenIn: string): Promise<QueryJoinPoolResponse>;
    quoteRemoveLiquidityOneToken(liquidityIn: BigNumber, tokenOut: string): Promise<QueryExitPoolResponse>;
    getAddLiquidityOneTokenZap(amountIn: BigNumber, tokenIn: string, liquidityOutMin: BigNumber, from: string, insertBalance: boolean): Promise<ZapStep>;
    getRemoveLiquidityOneTokenZap(liquidityIn: BigNumber, tokenOut: string, amountOutMin: BigNumber, from: string, insertBalance: boolean): Promise<ZapStep>;
}
