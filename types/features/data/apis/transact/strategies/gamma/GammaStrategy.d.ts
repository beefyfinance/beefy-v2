import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity, TokenErc20, TokenNative } from '../../../../entities/token';
import { type VaultStandard } from '../../../../entities/vault';
import { type AmmEntityGamma } from '../../../../entities/zap';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../../../store/types';
import type { IGammaPool } from '../../../amm/types';
import { type GammaDepositOption, type GammaDepositQuote, type GammaWithdrawOption, type GammaWithdrawQuote, type InputTokenAmount, type TokenAmount, type ZapQuoteStep, type ZapQuoteStepBuild, type ZapQuoteStepSplit, type ZapQuoteStepSwap, type ZapQuoteStepSwapAggregator } from '../../transact-types';
import { type IStandardVaultType } from '../../vaults/IVaultType';
import type { ZapStepResponse } from '../../zap/types';
import type { IComposableStrategy, UserlessZapDepositBreakdown, UserlessZapWithdrawBreakdown, ZapTransactHelpers } from '../IStrategy';
import type { GammaStrategyConfig } from '../strategy-configs';
type ZapHelpers = {
    chain: ChainEntity;
    slippage: number;
    state: BeefyState;
};
type PartialWithdrawQuote = Pick<GammaWithdrawQuote, 'steps' | 'outputs' | 'fee' | 'returned'>;
declare const strategyId = "gamma";
type StrategyId = typeof strategyId;
declare class GammaStrategyImpl implements IComposableStrategy<StrategyId> {
    protected options: GammaStrategyConfig;
    protected helpers: ZapTransactHelpers;
    static readonly id = "gamma";
    static readonly composable = true;
    readonly id = "gamma";
    protected readonly wnative: TokenErc20;
    protected readonly tokens: TokenEntity[];
    protected readonly lpTokens: TokenErc20[];
    protected readonly native: TokenNative;
    protected readonly amm: AmmEntityGamma;
    protected readonly pool: IGammaPool;
    protected readonly chain: ChainEntity;
    protected readonly depositToken: TokenEntity;
    protected readonly vault: VaultStandard;
    protected readonly vaultType: IStandardVaultType;
    constructor(options: GammaStrategyConfig, helpers: ZapTransactHelpers);
    getHelpers(): ZapTransactHelpers;
    beforeQuote(): Promise<void>;
    beforeStep(): Promise<void>;
    fetchDepositOptions(): Promise<GammaDepositOption[]>;
    getDepositRatio(state: BeefyState, inputToken: TokenEntity, inputAmount: BigNumber): Promise<BigNumber>;
    /**
     * We call this liquidity, but its really shares of the Gamma pool, we use liquidity to not confuse it with vault shares
     */
    quoteAddLiquidity(depositToken: TokenEntity, inputs: TokenAmount[]): Promise<{
        liquidity: TokenAmount;
        used: TokenAmount[];
        unused: TokenAmount[];
    }>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: GammaDepositOption): Promise<GammaDepositQuote>;
    protected fetchZapSwap(quoteStep: ZapQuoteStepSwap, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapSwapAggregator(quoteStep: ZapQuoteStepSwapAggregator, zapHelpers: ZapHelpers, insertBalance: boolean): Promise<ZapStepResponse>;
    protected fetchZapBuild(_quoteStep: ZapQuoteStepBuild, minInputs: TokenAmount[], zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    fetchDepositUserlessZapBreakdown(quote: GammaDepositQuote): Promise<UserlessZapDepositBreakdown>;
    fetchDepositStep(quote: GammaDepositQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOptions(): Promise<GammaWithdrawOption[]>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: GammaWithdrawOption): Promise<GammaWithdrawQuote>;
    fetchWithdrawQuoteAggregator(option: GammaWithdrawOption, breakOutputs: TokenAmount[], breakReturned: TokenAmount[], steps: ZapQuoteStep[]): Promise<PartialWithdrawQuote>;
    protected fetchZapSplit(quoteStep: ZapQuoteStepSplit, inputs: TokenAmount[], zapHelpers: ZapHelpers): Promise<ZapStepResponse>;
    fetchWithdrawUserlessZapBreakdown(quote: GammaWithdrawQuote): Promise<UserlessZapWithdrawBreakdown>;
    fetchWithdrawStep(quote: GammaWithdrawQuote, t: TFunction<Namespace>): Promise<Step>;
    canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean>;
    canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean>;
    protected aggregatorTokenSupport(): Promise<TokenEntity[]>;
}
export declare const GammaStrategy: typeof GammaStrategyImpl;
export {};
