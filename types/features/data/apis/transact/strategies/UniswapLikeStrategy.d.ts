import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenEntity, TokenErc20, TokenNative } from '../../../entities/token';
import { type VaultStandard } from '../../../entities/vault';
import { type AmmEntityUniswapLike } from '../../../entities/zap';
import type { Step } from '../../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../../store/types';
import type { IUniswapLikePool } from '../../amm/types';
import { type InputTokenAmount, type TokenAmount, type UniswapLikeDepositOption, type UniswapLikeDepositQuote, type UniswapLikeWithdrawOption, type UniswapLikeWithdrawQuote, type ZapQuoteStep, type ZapQuoteStepBuild, type ZapQuoteStepSplit, type ZapQuoteStepSwap, type ZapQuoteStepSwapAggregator, type ZapQuoteStepSwapPool } from '../transact-types';
import { type IStandardVaultType } from '../vaults/IVaultType';
import type { ZapStepResponse } from '../zap/types';
import type { UserlessZapDepositBreakdown, UserlessZapWithdrawBreakdown, ZapTransactHelpers } from './IStrategy';
import type { UniswapLikeStrategyConfig } from './strategy-configs';
type ZapHelpers = {
    chain: ChainEntity;
    pool: IUniswapLikePool;
    slippage: number;
    state: BeefyState;
};
type PartialWithdrawQuote<TAmm extends AmmEntityUniswapLike> = Pick<UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>, 'steps' | 'outputs' | 'fee' | 'returned'>;
/**
 * Base class for uniswap-v2-like strategies that have a IPool implementation
 */
export declare abstract class UniswapLikeStrategy<TAmm extends AmmEntityUniswapLike, TOptions extends UniswapLikeStrategyConfig<TAmm>> {
    protected options: TOptions;
    protected helpers: ZapTransactHelpers;
    protected readonly wnative: TokenErc20;
    protected readonly tokens: TokenEntity[];
    protected readonly lpTokens: TokenErc20[];
    protected readonly native: TokenNative;
    protected readonly amm: TAmm;
    protected readonly vault: VaultStandard;
    protected readonly vaultType: IStandardVaultType;
    abstract get id(): TOptions['strategyId'];
    protected abstract isAmmType(amm: AmmEntityUniswapLike): amm is TAmm;
    constructor(options: TOptions, helpers: ZapTransactHelpers);
    getHelpers(): ZapTransactHelpers;
    canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean>;
    canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean>;
    protected canRouteAcrossLp(token: TokenEntity): Promise<boolean>;
    aggregatorTokenSupport(): Promise<TokenEntity[]>;
    fetchDepositOptions(): Promise<UniswapLikeDepositOption<TAmm>[]>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: UniswapLikeDepositOption<TAmm>): Promise<UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>>;
    protected fetchDepositQuotePool(input: InputTokenAmount, option: UniswapLikeDepositOption<TAmm>): Promise<UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>>;
    protected fetchDepositQuoteAggregator(input: InputTokenAmount, option: UniswapLikeDepositOption<TAmm>): Promise<UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>>;
    protected fetchZapSwap(quoteStep: ZapQuoteStepSwap, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapSwapAggregator(quoteStep: ZapQuoteStepSwapAggregator, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapSwapPool(quoteStep: ZapQuoteStepSwapPool, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapBuild(quoteStep: ZapQuoteStepBuild, minInputs: TokenAmount[], zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    protected fetchZapSplit(quoteStep: ZapQuoteStepSplit, inputs: TokenAmount[], zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    fetchDepositUserlessZapBreakdown(quote: UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>): Promise<UserlessZapDepositBreakdown>;
    fetchDepositStep(quote: UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOptions(): Promise<UniswapLikeWithdrawOption<TAmm>[]>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: UniswapLikeWithdrawOption<TAmm>): Promise<UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>>;
    fetchWithdrawQuotePool(option: UniswapLikeWithdrawOption<TAmm>, breakOutputs: TokenAmount[], breakReturned: TokenAmount[], steps: ZapQuoteStep[], pool: IUniswapLikePool): Promise<PartialWithdrawQuote<TAmm>>;
    fetchWithdrawQuoteAggregator(option: UniswapLikeWithdrawOption<TAmm>, breakOutputs: TokenAmount[], breakReturned: TokenAmount[], steps: ZapQuoteStep[]): Promise<PartialWithdrawQuote<TAmm>>;
    fetchWithdrawUserlessZapBreakdown(quote: UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>): Promise<UserlessZapWithdrawBreakdown>;
    fetchWithdrawStep(quote: UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>, t: TFunction<Namespace>): Promise<Step>;
}
export {};
