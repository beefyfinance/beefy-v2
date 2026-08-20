import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../../entities/chain';
import { type TokenEntity, type TokenErc20, type TokenNative } from '../../../../entities/token';
import { type VaultStandard } from '../../../../entities/vault';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../../../store/types';
import type { QuoteResponse } from '../../swap/ISwapProvider';
import { type CurveDepositOption, type CurveDepositQuote, type CurveWithdrawOption, type CurveWithdrawQuote, type InputTokenAmount, type TokenAmount, type ZapQuoteStepBuild, type ZapQuoteStepSplit, type ZapQuoteStepSwap, type ZapQuoteStepSwapAggregator } from '../../transact-types';
import { type IStandardVaultType } from '../../vaults/IVaultType';
import type { ZapStepResponse } from '../../zap/types';
import type { IComposableStrategy, UserlessZapDepositBreakdown, UserlessZapWithdrawBreakdown, ZapTransactHelpers } from '../IStrategy';
import type { CurveStrategyConfig } from '../strategy-configs';
import type { CurveMethod, CurveTokenOption } from './types';
type ZapHelpers = {
    chain: ChainEntity;
    slippage: number;
    poolAddress: string;
    state: BeefyState;
};
type DepositLiquidity = {
    /** Liquidity input (coin for deposit, lp for withdraw) */
    input: TokenAmount;
    /** Liquidity output (lp for deposit, coin for withdraw) */
    output: TokenAmount;
    /** Which method we are using to deposit/withdraw liquidity */
    via: CurveTokenOption;
    /** Quote for swapping to/from coin if required */
    quote?: QuoteResponse;
};
type WithdrawLiquidity = DepositLiquidity & {
    /** How much token we have after the split */
    split: TokenAmount;
};
declare const strategyId = "curve";
type StrategyId = typeof strategyId;
declare class CurveStrategyImpl implements IComposableStrategy<StrategyId> {
    protected options: CurveStrategyConfig;
    protected helpers: ZapTransactHelpers;
    static readonly id = "curve";
    static readonly composable = true;
    readonly id = "curve";
    protected readonly native: TokenNative;
    protected readonly wnative: TokenErc20;
    protected readonly possibleTokens: CurveTokenOption[];
    protected readonly chain: ChainEntity;
    protected readonly depositToken: TokenEntity;
    protected readonly poolAddress: string;
    protected readonly vault: VaultStandard;
    protected readonly vaultType: IStandardVaultType;
    constructor(options: CurveStrategyConfig, helpers: ZapTransactHelpers);
    getHelpers(): ZapTransactHelpers;
    /**
     * Tokens are available so long as they are in the address book
     */
    protected selectAvailableTokens(state: BeefyState, chainId: ChainEntity['id'], methods: CurveMethod[]): CurveTokenOption[];
    fetchDepositOptions(): Promise<CurveDepositOption[]>;
    protected getDepositLiquidityDirect(input: InputTokenAmount, depositVia: CurveTokenOption): Promise<DepositLiquidity>;
    protected getDepositLiquidityAggregator(state: BeefyState, input: InputTokenAmount, depositVias: CurveTokenOption[]): Promise<DepositLiquidity>;
    protected getDepositLiquidity(state: BeefyState, input: InputTokenAmount, option: CurveDepositOption): Promise<DepositLiquidity>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: CurveDepositOption): Promise<CurveDepositQuote>;
    protected fetchZapSwap(quoteStep: ZapQuoteStepSwap, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapSwapAggregator(quoteStep: ZapQuoteStepSwapAggregator, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapBuild(_quoteStep: ZapQuoteStepBuild, depositVia: CurveTokenOption, minInputAmount: BigNumber, zapHelpers: ZapHelpers, insertBalance?: boolean): Promise<ZapStepResponse>;
    fetchDepositUserlessZapBreakdown(quote: CurveDepositQuote): Promise<UserlessZapDepositBreakdown>;
    fetchDepositStep(quote: CurveDepositQuote, t: TFunction<Namespace<string>>): Promise<Step>;
    fetchWithdrawOptions(): Promise<CurveWithdrawOption[]>;
    protected getWithdrawLiquidityDirect(input: TokenAmount, wanted: TokenEntity, withdrawVia: CurveTokenOption): Promise<WithdrawLiquidity>;
    protected getWithdrawLiquidityAggregator(state: BeefyState, input: TokenAmount, wanted: TokenEntity, withdrawVias: CurveTokenOption[]): Promise<WithdrawLiquidity>;
    protected getWithdrawLiquidity(state: BeefyState, input: TokenAmount, wanted: TokenEntity, option: CurveWithdrawOption): Promise<WithdrawLiquidity>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: CurveWithdrawOption): Promise<CurveWithdrawQuote>;
    protected fetchZapSplit(_quoteStep: ZapQuoteStepSplit, inputs: TokenAmount[], via: CurveTokenOption, zapHelpers: ZapHelpers, insertBalance?: boolean): Promise<ZapStepResponse>;
    fetchWithdrawUserlessZapBreakdown(quote: CurveWithdrawQuote): Promise<UserlessZapWithdrawBreakdown>;
    fetchWithdrawStep(quote: CurveWithdrawQuote, t: TFunction<Namespace<string>>): Promise<Step>;
    canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean>;
    canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean>;
    protected canRouteTokenAcrossPool(token: TokenEntity): Promise<boolean>;
    protected aggregatorTokenSupport(): Promise<{
        map: {
            [k: string]: CurveTokenOption[];
        };
        tokens: TokenEntity[][];
        any: TokenEntity[];
    }>;
}
export declare const CurveStrategy: typeof CurveStrategyImpl;
export {};
