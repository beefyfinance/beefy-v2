import type { ChainEntity } from '../../../entities/chain';
import type { TokenEntity } from '../../../entities/token';
import type { VaultEntity } from '../../../entities/vault';
import type { BeefyState } from '../../../store/types';
import type { StrategySwapConfig } from '../strategies/strategy-configs';
import type { ISwapAggregator, TokenSupport } from './ISwapAggregator';
import type { ISwapProvider, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './ISwapProvider';
export declare class SwapAggregator implements ISwapAggregator {
    protected providers: ISwapProvider[];
    protected providersById: Record<string, ISwapProvider>;
    constructor(providers: ISwapProvider[]);
    with(provider: ISwapProvider): SwapAggregator;
    protected allowedProviders(options: StrategySwapConfig | undefined): ISwapProvider[];
    protected allowedTokens(tokens: TokenEntity[], options: StrategySwapConfig | undefined): TokenEntity[];
    protected providerSupportedTokens(provider: ISwapProvider, vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState, options: StrategySwapConfig | undefined): Promise<TokenEntity[]>;
    fetchTokenSupport(wantedTokens: TokenEntity[], vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState, options?: StrategySwapConfig): Promise<TokenSupport>;
    protected tokensSupportingFilter(tokensPerProvider: TokenEntity[][], filterFn: (tokens: TokenEntity[]) => boolean, state: BeefyState): TokenEntity[];
    protected mergeAndSortTokens(tokens: TokenEntity[][], state: BeefyState): TokenEntity[];
    canSwapTokenPair(fromToken: TokenEntity, toToken: TokenEntity, vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState, options?: StrategySwapConfig): Promise<boolean>;
    protected canSwapBetween(provider: ISwapProvider, vaultId: VaultEntity['id'] | undefined, tokenA: TokenEntity, tokenB: TokenEntity, state: BeefyState, options?: StrategySwapConfig): Promise<boolean>;
    fetchQuotes(request: QuoteRequest, state: BeefyState, options?: StrategySwapConfig): Promise<QuoteResponse[]>;
    fetchSwap(providerId: string, request: SwapRequest, state: BeefyState): Promise<SwapResponse>;
}
