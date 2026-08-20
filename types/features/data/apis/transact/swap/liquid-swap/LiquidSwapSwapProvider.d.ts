import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
import type { LiquidSwapSwapConfig } from '../../../config-types';
import type { QuoteResponse as LiquidSwapQuoteResponse } from '../../../liquid-swap/liquid-swap-types';
import type { ISwapProvider, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../ISwapProvider';
export declare class LiquidSwapSwapProvider implements ISwapProvider {
    getId(): string;
    fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse<LiquidSwapQuoteResponse>>;
    fetchSwap(request: SwapRequest<LiquidSwapQuoteResponse>, state: BeefyState): Promise<SwapResponse>;
    getSupportedTokens(vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState): Promise<TokenEntity[]>;
    getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]>;
    protected getTokenAddress(state: BeefyState, token: TokenEntity): string;
    protected getConfigForChain(chainId: ChainEntity['id'], state: BeefyState): LiquidSwapSwapConfig | undefined;
}
