import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../../../entities/vault';
import type { BeefyState } from '../../../store/types';
import type { QuoteResponse } from '../swap/ISwapProvider';
import { type TokenAmount, type TransactQuote, type ZapFee } from '../transact-types';
export declare const ZERO_FEE: ZapFee;
/**
 * The quote to render the result against. Unwraps a dest-composed deposit (cross-chain, or same-chain vault-to-vault)
 * to its real dest deposit quote so a CLM destination shows its position breakdown rather than just the share token;
 * all other quotes pass through unchanged.
 */
export declare function getEffectiveQuote(quote: TransactQuote): TransactQuote;
/** false for any quote where there is exactly one matching input+output token else true*/
export declare function quoteHasTransformation(quote: TransactQuote): boolean;
/** Convert a v2v source share amount to the deposit-token TokenAmount via ppfs (pass-through for vaults without a receipt token). */
export declare function convertVaultShareToDepositTokenAmount(state: BeefyState, srcVaultId: VaultEntity['id'], shareAmount: BigNumber): TokenAmount;
/**
 * Returns the total value of the token amounts in USD
 */
export declare function totalValueOfTokenAmounts(tokenAmounts: TokenAmount[], state: BeefyState): BigNumber;
/**
 * Returns the percentage difference between the input and output token amounts
 */
export declare function calculatePriceImpact(inputs: TokenAmount[], outputs: TokenAmount[], returned: TokenAmount[], state: BeefyState, knownFeesUsd?: BigNumber): number;
/**
 * Sort quotes by highest output amount first
 */
export declare function sortQuotes(quotes: QuoteResponse[]): QuoteResponse[];
