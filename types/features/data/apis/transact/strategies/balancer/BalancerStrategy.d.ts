import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../../entities/chain';
import { type TokenEntity, type TokenErc20, type TokenNative } from '../../../../entities/token';
import { type VaultStandard } from '../../../../entities/vault';
import { type AmmEntityBalancer } from '../../../../entities/zap';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../../../store/types';
import { ComposableStablePool } from '../../../amm/balancer/composable-stable/ComposableStablePool';
import { GyroPool } from '../../../amm/balancer/gyro/GyroPool';
import { MetaStablePool } from '../../../amm/balancer/meta-stable/MetaStablePool';
import { WeightedPool } from '../../../amm/balancer/weighted/WeightedPool';
import type { QuoteResponse } from '../../swap/ISwapProvider';
import { type BalancerDepositOption, type BalancerDepositOptionAllAggregator, type BalancerDepositOptionSingleAggregator, type BalancerDepositQuote, type BalancerWithdrawOption, type BalancerWithdrawOptionAllAggregator, type BalancerWithdrawOptionAllBreakOnly, type BalancerWithdrawOptionSingleAggregator, type BalancerWithdrawOptionSingleDirect, type BalancerWithdrawQuote, type InputTokenAmount, type TokenAmount, type ZapQuoteStepBuild, type ZapQuoteStepSwap, type ZapQuoteStepSwapAggregator } from '../../transact-types';
import { type IStandardVaultType } from '../../vaults/IVaultType';
import type { ZapStepResponse } from '../../zap/types';
import type { IComposableStrategy, UserlessZapDepositBreakdown, UserlessZapWithdrawBreakdown, ZapTransactHelpers } from '../IStrategy';
import type { BalancerStrategyConfig } from '../strategy-configs';
type ZapHelpers = {
    slippage: number;
    state: BeefyState;
};
declare const strategyId = "balancer";
type StrategyId = typeof strategyId;
/**
 * Balancer: joinPool() to deposit / exitPool() to withdraw liquidity
 */
declare class BalancerStrategyImpl implements IComposableStrategy<StrategyId> {
    protected options: BalancerStrategyConfig;
    protected helpers: ZapTransactHelpers;
    static readonly id = "balancer";
    static readonly composable = true;
    readonly id = "balancer";
    protected readonly native: TokenNative;
    protected readonly wnative: TokenErc20;
    protected readonly poolTokens: TokenEntity[];
    protected readonly poolTokensincludingWrappedNative: TokenEntity[];
    protected readonly chain: ChainEntity;
    protected readonly depositToken: TokenEntity;
    protected readonly vault: VaultStandard;
    protected readonly vaultType: IStandardVaultType;
    protected readonly amm: AmmEntityBalancer;
    protected readonly singleTokenOptions: TokenEntity[];
    protected readonly allTokenOptions: TokenEntity[];
    constructor(options: BalancerStrategyConfig, helpers: ZapTransactHelpers);
    getHelpers(): ZapTransactHelpers;
    protected selectSingleTokenOptions(state: BeefyState): TokenEntity[];
    protected selectAllTokenOptions(state: BeefyState): TokenEntity[];
    protected validatePoolType(): void;
    protected selectPoolTokens(state: BeefyState, chainId: ChainEntity['id'], tokenAddresses: string[]): TokenEntity[];
    protected buildDepositOptionsForAll(): Promise<BalancerDepositOption[]>;
    protected buildDepositOptionsForSingle(): Promise<BalancerDepositOption[]>;
    fetchDepositOptions(): Promise<BalancerDepositOption[]>;
    protected getPool: (...props: never[]) => ComposableStablePool | GyroPool | MetaStablePool | WeightedPool;
    fetchDepositQuote(inputs: InputTokenAmount[], option: BalancerDepositOption): Promise<BalancerDepositQuote>;
    protected fetchDepositSwapsLiquidity(input: TokenAmount, option: BalancerDepositOption): Promise<{
        input: TokenAmount;
        swaps: {
            input: TokenAmount;
            output: TokenAmount;
            quote?: QuoteResponse;
        }[];
        liquidity: {
            inputs: TokenAmount[];
            output: TokenAmount;
            usedInput: TokenAmount[];
            unusedInput: TokenAmount[];
        };
        output: TokenAmount;
    }>;
    protected getSwapAmounts(input: TokenAmount): Promise<Array<{
        from: TokenAmount;
        to: TokenEntity;
    }>>;
    protected quoteAddLiquidity(inputs: TokenAmount[]): Promise<{
        liquidity: TokenAmount;
        usedInput: TokenAmount[];
        unusedInput: TokenAmount[];
    }>;
    protected fetchDepositSwapQuotesAllAggregator(input: TokenAmount, _option: BalancerDepositOptionAllAggregator): Promise<Array<{
        input: TokenAmount;
        output: TokenAmount;
        quote?: QuoteResponse;
    }[]>>;
    protected fetchDepositSwapQuotesSingleAggregator(input: TokenAmount, option: BalancerDepositOptionSingleAggregator): Promise<Array<{
        input: TokenAmount;
        output: TokenAmount;
        quote?: QuoteResponse;
    }[]>>;
    protected fetchZapSwap(quoteStep: ZapQuoteStepSwap, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapSwapAggregator(quoteStep: ZapQuoteStepSwapAggregator, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapBuild(_quoteStep: ZapQuoteStepBuild, minInputs: TokenAmount[], _option: BalancerDepositOption, zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    fetchDepositUserlessZapBreakdown(quote: BalancerDepositQuote): Promise<UserlessZapDepositBreakdown>;
    fetchDepositStep(quote: BalancerDepositQuote, t: TFunction<Namespace<string>>): Promise<Step>;
    protected buildWithdrawOptionsForAll(): Promise<BalancerWithdrawOption[]>;
    protected buildWithdrawOptionsForSingle(): Promise<BalancerWithdrawOption[]>;
    fetchWithdrawOptions(): Promise<BalancerWithdrawOption[]>;
    protected quoteRemoveLiquidity(input: TokenAmount): Promise<{
        liquidity: TokenAmount;
        outputs: TokenAmount[];
    }>;
    protected quoteRemoveLiquidityOneToken(input: TokenAmount, wantedToken: TokenEntity): Promise<{
        liquidity: TokenAmount;
        outputs: TokenAmount[];
    }>;
    protected fetchWithdrawLiquidityAll(input: TokenAmount, _option: BalancerWithdrawOptionAllAggregator | BalancerWithdrawOptionAllBreakOnly): Promise<{
        input: TokenAmount;
        liquidity: {
            input: TokenAmount;
            outputs: TokenAmount[];
        };
    }[]>;
    protected fetchWithdrawLiquiditySingleAggregator(input: TokenAmount, option: BalancerWithdrawOptionSingleAggregator): Promise<{
        input: TokenAmount;
        liquidity: {
            input: TokenAmount;
            outputs: TokenAmount[];
        };
    }[]>;
    protected fetchWithdrawLiquiditySingleDirect(input: TokenAmount, option: BalancerWithdrawOptionSingleDirect): Promise<{
        input: TokenAmount;
        liquidity: {
            input: TokenAmount;
            outputs: TokenAmount[];
        };
    }[]>;
    protected fetchWithdrawLiquiditySwaps(input: TokenAmount, option: BalancerWithdrawOption): Promise<{
        input: TokenAmount;
        liquidity: {
            input: TokenAmount;
            outputs: TokenAmount[];
        };
        swaps: {
            input: TokenAmount;
            quote: QuoteResponse | undefined;
            output: TokenAmount;
        }[];
        outputs: TokenAmount[];
    }>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: BalancerWithdrawOption): Promise<BalancerWithdrawQuote>;
    protected fetchZapSplitAll(inputs: TokenAmount[], zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    protected fetchZapSplitOne(inputs: TokenAmount[], zapHelpers: ZapHelpers, viaToken: TokenEntity): Promise<ZapStepResponse>;
    protected fetchZapSplit(quote: BalancerWithdrawQuote, inputs: TokenAmount[], zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    fetchWithdrawUserlessZapBreakdown(quote: BalancerWithdrawQuote): Promise<UserlessZapWithdrawBreakdown>;
    fetchWithdrawStep(quote: BalancerWithdrawQuote, t: TFunction<Namespace<string>>): Promise<Step>;
    canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean>;
    canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean>;
    protected canRouteAcrossEitherEmissionPath(token: TokenEntity): Promise<boolean>;
    protected aggregatorTokensCanSwapToAllOf(allTokens: TokenEntity[]): Promise<TokenEntity[]>;
    protected aggregatorTokensCanSwapToTokens(tokens: TokenEntity[]): Promise<{
        inputTokens: TokenEntity[];
        inputTokenToWanted: Record<string, TokenEntity[]>;
    }>;
}
export declare const BalancerStrategy: typeof BalancerStrategyImpl;
export {};
