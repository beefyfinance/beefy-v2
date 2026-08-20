import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../../entities/chain';
import { type TokenEntity } from '../../../../entities/token';
import { type VaultStandard } from '../../../../entities/vault';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../../../store/types';
import { PendleMarket } from '../../../amm/pendle/PendleMarket';
import type { QuoteResponse } from '../../swap/ISwapProvider';
import { type InputTokenAmount, type PendleV2DepositOption, type PendleV2DepositQuote, type PendleV2WithdrawOption, type PendleV2WithdrawQuote, type TokenAmount, type ZapQuoteStepBuild, type ZapQuoteStepSplit, type ZapQuoteStepSwap, type ZapQuoteStepSwapAggregator } from '../../transact-types';
import { type IStandardVaultType } from '../../vaults/IVaultType';
import type { ZapStepResponse } from '../../zap/types';
import type { IComposableStrategy, UserlessZapDepositBreakdown, UserlessZapWithdrawBreakdown, ZapTransactHelpers } from '../IStrategy';
import type { PendleV2StrategyConfig } from '../strategy-configs';
type ZapHelpers = {
    chain: ChainEntity;
    slippage: number;
    state: BeefyState;
};
type DepositLiquidity = {
    /** Token that is fed into the Pendle market to mint the LP */
    input: TokenAmount;
    /** Resulting LP (vault deposit token) */
    output: TokenAmount;
    /** Which deposit token we minted through */
    via: TokenEntity;
    /** Quote for swapping the user input to `via`, if routing via aggregator */
    quote?: QuoteResponse;
};
type WithdrawLiquidity = {
    /** LP (vault deposit token) being removed */
    input: TokenAmount;
    /** Token received from removing the LP */
    split: TokenAmount;
    /** Final output after optional swap (== split when direct) */
    output: TokenAmount;
    /** Which deposit token we removed through */
    via: TokenEntity;
    /** Quote for swapping `split` to the wanted token, if routing via aggregator */
    quote?: QuoteResponse;
};
type AggregatorTokenSupport = {
    /** User input tokens routable to at least one deposit token via an aggregator */
    inputTokens: TokenEntity[];
    /** Deposit tokens the LP can be minted from / redeemed to after an aggregator swap */
    viaTokens: TokenEntity[];
};
declare const strategyId = "pendle-v2";
type StrategyId = typeof strategyId;
declare class PendleStrategyImpl implements IComposableStrategy<StrategyId> {
    protected options: PendleV2StrategyConfig;
    protected helpers: ZapTransactHelpers;
    static readonly id = "pendle-v2";
    static readonly composable = true;
    readonly id = "pendle-v2";
    protected readonly chain: ChainEntity;
    /** The vault deposit token — i.e. the Pendle market LP token */
    protected readonly depositToken: TokenEntity;
    /** Tokens the LP can be minted from / redeemed to directly (SY tokensIn) */
    protected readonly possibleTokens: TokenEntity[];
    protected readonly routerAddress: string;
    protected readonly market: PendleMarket;
    protected readonly vault: VaultStandard;
    protected readonly vaultType: IStandardVaultType;
    /** Aggregator token support is constant for the strategy, so resolve it once */
    private aggregatorSupport;
    constructor(options: PendleV2StrategyConfig, helpers: ZapTransactHelpers);
    getHelpers(): ZapTransactHelpers;
    fetchDepositOptions(): Promise<PendleV2DepositOption[]>;
    protected getDepositLiquidityDirect(input: InputTokenAmount, viaToken: TokenEntity): Promise<DepositLiquidity>;
    protected getDepositLiquidityAggregator(state: BeefyState, input: InputTokenAmount, viaTokens: TokenEntity[]): Promise<DepositLiquidity>;
    protected getDepositLiquidity(state: BeefyState, input: InputTokenAmount, option: PendleV2DepositOption): Promise<DepositLiquidity>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: PendleV2DepositOption): Promise<PendleV2DepositQuote>;
    protected fetchZapSwap(quoteStep: ZapQuoteStepSwap, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapSwapAggregator(quoteStep: ZapQuoteStepSwapAggregator, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapBuild(_quoteStep: ZapQuoteStepBuild, viaToken: TokenEntity, minInputAmount: BigNumber, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    fetchDepositUserlessZapBreakdown(quote: PendleV2DepositQuote): Promise<UserlessZapDepositBreakdown>;
    fetchDepositStep(quote: PendleV2DepositQuote, t: TFunction<Namespace<string>>): Promise<Step>;
    fetchWithdrawOptions(): Promise<PendleV2WithdrawOption[]>;
    protected getWithdrawLiquidityDirect(input: TokenAmount, wanted: TokenEntity, viaToken: TokenEntity): Promise<WithdrawLiquidity>;
    protected getWithdrawLiquidityAggregator(state: BeefyState, input: TokenAmount, wanted: TokenEntity, viaTokens: TokenEntity[]): Promise<WithdrawLiquidity>;
    protected getWithdrawLiquidity(state: BeefyState, input: TokenAmount, wanted: TokenEntity, option: PendleV2WithdrawOption): Promise<WithdrawLiquidity>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: PendleV2WithdrawOption): Promise<PendleV2WithdrawQuote>;
    protected fetchZapSplit(_quoteStep: ZapQuoteStepSplit, inputs: TokenAmount[], viaToken: TokenEntity, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    fetchWithdrawUserlessZapBreakdown(quote: PendleV2WithdrawQuote): Promise<UserlessZapWithdrawBreakdown>;
    fetchWithdrawStep(quote: PendleV2WithdrawQuote, t: TFunction<Namespace<string>>): Promise<Step>;
    canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean>;
    canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean>;
    protected canRouteTokenAcrossPool(token: TokenEntity): Promise<boolean>;
    protected aggregatorTokenSupport(): Promise<AggregatorTokenSupport>;
    protected computeAggregatorTokenSupport(): Promise<AggregatorTokenSupport>;
}
export declare const PendleStrategy: typeof PendleStrategyImpl;
export {};
