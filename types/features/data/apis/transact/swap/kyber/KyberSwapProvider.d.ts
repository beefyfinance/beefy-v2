import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
import type { KyberSwapSwapConfig } from '../../../config-types';
import type { RouteSummary } from '../../../kyber/kyber-types';
import type { ISwapProvider, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../ISwapProvider';
export declare class KyberSwapProvider implements ISwapProvider {
    getId(): string;
    protected getTokenAddress(token: TokenEntity): string;
    protected getConfigForChain(chainId: ChainEntity['id'], state: BeefyState): KyberSwapSwapConfig | undefined;
    fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse<RouteSummary>>;
    fetchSwap(request: SwapRequest<RouteSummary>, state: BeefyState): Promise<SwapResponse>;
    getSupportedTokens(vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState): Promise<TokenEntity[]>;
    getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]>;
}
