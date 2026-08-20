import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../../../../entities/vault';
import type { DestHandlerContext, DestHandlerQuote, DestHandlerSteps, IDestHandler, VaultDestState } from '../types';
/**
 * Vault dest handler: deposit the handler's `inputToken` into a vault on the dst chain.
 * fetchZapSteps may run via the dst-only recovery path when hookData oversizes.
 */
export declare class VaultDestHandler implements IDestHandler<VaultDestState> {
    private readonly destVaultId;
    readonly kind: "vault";
    constructor(destVaultId: VaultEntity['id']);
    fetchQuote(inputAmount: BigNumber, ctx: DestHandlerContext): Promise<DestHandlerQuote<VaultDestState>>;
    fetchZapSteps(quote: DestHandlerQuote<VaultDestState>, ctx: DestHandlerContext): Promise<DestHandlerSteps>;
    /** Find a composable dst strategy accepting the input token; identity case is handled by SingleStrategy's identity option. */
    private static findStrategyForInputDeposit;
}
