import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
import type { OneInchSwapConfig } from '../../../config-types';
import type { ISwapProvider, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../ISwapProvider';
export declare class OneInchSwapProvider implements ISwapProvider {
    getId(): string;
    protected getTokenAddress(token: TokenEntity): string;
    protected getConfigForChain(chainId: ChainEntity['id'], state: BeefyState): OneInchSwapConfig | undefined;
    fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse>;
    fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse>;
    getSupportedTokens(vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState): Promise<TokenEntity[]>;
    getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]>;
}
