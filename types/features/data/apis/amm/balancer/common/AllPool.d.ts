import type { BalancerFeature, IBalancerAllPool } from '../types';
import type { ChainEntity } from '../../../../entities/chain';
import type { ExitPoolRequest, JoinPoolRequest, PoolConfig, QueryExitPoolResponse, QueryJoinPoolResponse, VaultConfig } from '../vault/types';
import type { ZapStep } from '../../../transact/zap/types';
import type BigNumber from 'bignumber.js';
import { CommonPool } from './CommonPool';
import { type ExitPoolUserData, type JoinPoolUserData, PoolExitKind, PoolJoinKind } from './types';
import type { GetContractReturnType } from 'viem';
/** Join/Exit with all tokens in ratio */
export declare abstract class AllPool extends CommonPool implements IBalancerAllPool {
    readonly chain: ChainEntity;
    readonly vaultConfig: VaultConfig;
    readonly config: PoolConfig;
    protected constructor(chain: ChainEntity, vaultConfig: VaultConfig, config: PoolConfig);
    abstract supportsFeature(feature: BalancerFeature): boolean;
    abstract getSwapRatios(): Promise<BigNumber[]>;
    protected abstract getPoolContract(): GetContractReturnType;
    protected abstract getJoinKindValue(kind: PoolJoinKind): number;
    protected abstract getExitKindValue(kind: PoolExitKind): number;
    protected customizeJoinPoolRequest(request: JoinPoolRequest<JoinPoolUserData>): JoinPoolRequest<JoinPoolUserData>;
    protected customizeExitPoolRequest(request: ExitPoolRequest<ExitPoolUserData>): ExitPoolRequest<ExitPoolUserData>;
    protected customizeQueryJoinPoolResponse(response: QueryJoinPoolResponse): QueryJoinPoolResponse;
    protected customizeQueryExitPoolResponse(response: QueryExitPoolResponse): QueryExitPoolResponse;
    quoteAddLiquidity(amountsIn: BigNumber[]): Promise<QueryJoinPoolResponse>;
    getAddLiquidityZap(amountsIn: BigNumber[], minLiquidity: BigNumber, from: string, insertBalance: boolean): Promise<ZapStep>;
    quoteRemoveLiquidity(liquidityIn: BigNumber): Promise<QueryExitPoolResponse>;
    protected quoteRemoveLiquidityWithUserData(liquidityIn: BigNumber, userData: ExitPoolUserData): Promise<QueryExitPoolResponse>;
    getRemoveLiquidityZap(liquidityIn: BigNumber, minAmountsOut: BigNumber[], from: string, insertBalance: boolean): Promise<ZapStep>;
    protected getRemoveLiquidityZapWithUserData(minAmountsOut: BigNumber[], from: string, insertBalance: boolean, userData: ExitPoolUserData): Promise<ZapStep>;
}
