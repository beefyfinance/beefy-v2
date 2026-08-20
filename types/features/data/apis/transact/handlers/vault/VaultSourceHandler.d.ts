import type { VaultEntity } from '../../../../entities/vault';
import { type InputTokenAmount, type ZapWithdrawQuote } from '../../transact-types';
import type { ISourceHandler, SourceHandlerContext, SourceHandlerQuote, SourceHandlerSteps } from '../types';
/** Strategy is re-resolved at step time (via underlyingQuote.strategyId) to avoid stale state across RPC calls. */
type VaultSourceState = {
    underlyingQuote: ZapWithdrawQuote;
};
/**
 * Vault source handler: withdraw vault shares into the handler's `outputToken`.
 * `slippageAppliesToOutput` is hard-coded true — vault withdraws always slip.
 */
export declare class VaultSourceHandler implements ISourceHandler<VaultSourceState> {
    private readonly srcVaultId;
    readonly kind: "vault";
    constructor(srcVaultId: VaultEntity['id']);
    fetchQuote(input: InputTokenAmount, ctx: SourceHandlerContext): Promise<SourceHandlerQuote<VaultSourceState>>;
    fetchZapSteps(quote: SourceHandlerQuote<VaultSourceState>, ctx: SourceHandlerContext): Promise<SourceHandlerSteps>;
    private adaptInputToStrategy;
    /** Find a composable src strategy whose withdraw produces the output token; identity case is handled by SingleStrategy's identity option. */
    private static findStrategyForOutputWithdraw;
}
export {};
