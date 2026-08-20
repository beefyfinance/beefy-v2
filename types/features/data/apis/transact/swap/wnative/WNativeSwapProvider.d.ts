import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
import type { ISwapProvider, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../ISwapProvider';
export declare class WNativeSwapProvider implements ISwapProvider {
    getId(): string;
    fetchQuote(request: QuoteRequest, _state: BeefyState): Promise<QuoteResponse>;
    fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse>;
    getSupportedTokens(_vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState): Promise<TokenEntity[]>;
    protected encodeWrapCall(): string;
    protected encodeUnwrapCall(amountWei: string): string;
    getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]>;
}
