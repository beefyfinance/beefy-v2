import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import type { CrossChainRecoveryParams } from '../../../../reducers/wallet/transact-types';
import { type CrossChainDepositOption, type CrossChainDepositQuote, type CrossChainWithdrawOption, type CrossChainWithdrawQuote, type InputTokenAmount, type RecoveryQuote } from '../../transact-types';
import { type ChainTransactHelpers, type IZapStrategy, type ZapTransactHelpers } from '../IStrategy';
import type { CrossChainStrategyConfig } from '../strategy-configs';
declare const strategyId = "cross-chain";
type StrategyId = typeof strategyId;
declare class CrossChainStrategyImpl implements IZapStrategy<StrategyId> {
    protected options: CrossChainStrategyConfig;
    protected helpers: ZapTransactHelpers;
    static readonly id = "cross-chain";
    readonly id = "cross-chain";
    private readonly allowedSourceChains;
    private readonly allowedDestChains;
    constructor(options: CrossChainStrategyConfig, helpers: ZapTransactHelpers);
    private makeSourceContext;
    /**
     * Single factory for both the normal flow and the dst-only recovery flow.
     * `pageVaultId` and `resolveHelpersForVault` are sourced off `this.helpers` because the
     * orchestrator is constructed with the page vault's helpers in both paths.
     */
    private makeDestContext;
    private makeSourceHandler;
    private makeDestHandler;
    private resolveHelpersForVault;
    /**
     * Build the CCTP burn step. On oversize, falls back to an empty-route passthrough payload
     * and the dst leg becomes a recovery tx. `isTwoStep` is true iff a non-passthrough handler
     * hit the fallback; callers use it to mark the `PendingCrossChainOp`.
     */
    private composeBurnStep;
    fetchDepositOptions(): Promise<CrossChainDepositOption[]>;
    /**
     * Vault-to-vault deposit enumeration: for each user-held vault on a CCTP-supported other
     * chain that can withdraw to USDC, emit a `srcHandlerKind='vault'` option.
     */
    private enumerateVaultSrcDepositOptions;
    /**
     * Direction-agnostic quote assembly; `fetchDepositQuote` and `fetchWithdrawQuote` adapt
     * this into their respective quote shapes.
     */
    private quoteCrossChain;
    fetchDepositQuote(inputs: InputTokenAmount[], option: CrossChainDepositOption): Promise<CrossChainDepositQuote>;
    /**
     * Direction-agnostic step assembly; deposit and withdraw both delegate here.
     * `order.inputs` comes from the source handler: vault-src produces the share token (mooToken),
     * swap-src produces the user's input token; the Zap Router uses it to `transferFrom` the user.
     */
    private stepCrossChain;
    fetchDepositStep(quote: CrossChainDepositQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOptions(): Promise<CrossChainWithdrawOption[]>;
    /**
     * Vault-to-vault withdraw enumeration: emit a `destHandlerKind='vault'` option per dst-vault
     * candidate on every supported chain other than the page vault's.
     */
    private enumerateVaultDstWithdrawOptions;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: CrossChainWithdrawOption): Promise<CrossChainWithdrawQuote>;
    fetchWithdrawStep(quote: CrossChainWithdrawQuote, t: TFunction<Namespace>): Promise<Step>;
    private buildRecoveryMetadata;
    private makeRecoveryHandler;
    /**
     * Captures the inner DestHandlerQuote on `RecoveryQuote.destHandlerQuote` so the step path
     * can reuse it without re-querying the aggregator (no display-vs-execution route drift).
     */
    fetchRecoveryQuote(recovery: Exclude<CrossChainRecoveryParams, {
        destHandlerKind: 'passthrough';
    }>, bridgedAmount: BigNumber, destChainHelpers: ChainTransactHelpers): Promise<RecoveryQuote>;
    /**
     * Reuses the captured `DestHandlerQuote` on `quote.destHandlerQuote` and calls fetchZapSteps
     * directly — no second fetchQuote call.
     */
    fetchRecoveryStep(recovery: Exclude<CrossChainRecoveryParams, {
        destHandlerKind: 'passthrough';
    }>, quote: RecoveryQuote, destChainHelpers: ChainTransactHelpers, opId: string, t: TFunction<Namespace>): Promise<Step>;
}
export declare const CrossChainStrategy: typeof CrossChainStrategyImpl;
export {};
