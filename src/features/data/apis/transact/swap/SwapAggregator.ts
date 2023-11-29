import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './ISwapProvider';
import type { TokenEntity } from '../../../entities/token';
import { isTokenEqual, isTokenNative } from '../../../entities/token';
import type { ChainEntity } from '../../../entities/chain';
import type { BeefyState } from '../../../../../redux-types';
import { mergeTokenLists } from '../helpers/tokens';
import { partition } from 'lodash';
import { isFulfilledResult } from '../../../../../helpers/promises';
import type { ISwapAggregator, TokenSupport } from './ISwapAggregator';
import type { VaultEntity } from '../../../entities/vault';
import { orderBy } from 'lodash-es';
import { selectZapTokenScore } from '../../../selectors/zap';
import type { StrategySwapOption } from '../strategies/IStrategy';
import { sortQuotes } from '../helpers/quotes';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens';

export class SwapAggregator implements ISwapAggregator {
  protected providersById: Record<string, ISwapProvider> = {};

  constructor(protected providers: ISwapProvider[]) {
    this.providers.forEach(provider => {
      this.providersById[provider.getId()] = provider;
    });
  }

  with(provider: ISwapProvider) {
    return new SwapAggregator([...this.providers, provider]);
  }

  protected allowedProviders(options: StrategySwapOption | undefined) {
    const blockedProviders: string[] = options?.blockProviders || [];

    if (blockedProviders.length === 0) {
      return this.providers;
    }

    return this.providers.filter(provider => !blockedProviders.includes(provider.getId()));
  }

  protected allowedTokens(tokens: TokenEntity[], options: StrategySwapOption | undefined) {
    const blockedTokens: string[] = options?.blockTokens || [];

    if (blockedTokens.length === 0) {
      return tokens;
    }

    return tokens.filter(token => !blockedTokens.includes(token.id));
  }

  protected async providerSupportedTokens(
    provider: ISwapProvider,
    vaultId: VaultEntity['id'],
    chainId: ChainEntity['id'],
    state: BeefyState,
    options: StrategySwapOption | undefined
  ) {
    const chains = await provider.getSupportedChains(state);
    if (!chains.includes(chainId)) {
      return [];
    }

    const tokens = await provider.getSupportedTokens(vaultId, chainId, state);
    return this.allowedTokens(tokens, options);
  }

  async fetchTokenSupport(
    wantedTokens: TokenEntity[],
    vaultId: VaultEntity['id'],
    chainId: ChainEntity['id'],
    state: BeefyState,
    options?: StrategySwapOption
  ): Promise<TokenSupport> {
    const allowedProviders = this.allowedProviders(options);
    const tokensPerProvider = await Promise.all(
      allowedProviders.map(provider =>
        this.providerSupportedTokens(provider, vaultId, chainId, state, options)
      )
    );

    const supportPerWanted = wantedTokens.map(wantedToken =>
      this.tokensSupportingFilter(
        tokensPerProvider,
        (providerTokens: TokenEntity[]) =>
          providerTokens.some(providerToken => isTokenEqual(providerToken, wantedToken)),
        state
      )
    );

    // @dev any is same as wanted[0] if there is only 1 token to check
    if (supportPerWanted.length === 1) {
      return {
        tokens: supportPerWanted,
        any: supportPerWanted[0],
      };
    }

    const supportAny = this.tokensSupportingFilter(
      tokensPerProvider,
      (providerTokens: TokenEntity[]) =>
        wantedTokens.some(wantedToken =>
          providerTokens.some(providerToken => isTokenEqual(providerToken, wantedToken))
        ),
      state
    );

    return {
      tokens: supportPerWanted,
      any: supportAny,
    };
  }

  protected tokensSupportingFilter(
    tokensPerProvider: TokenEntity[][],
    filterFn: (tokens: TokenEntity[]) => boolean,
    state: BeefyState
  ): TokenEntity[] {
    const tokensPerProviderSupportingWanted = tokensPerProvider.filter(
      providerTokens => providerTokens.length > 1 && filterFn(providerTokens)
    );

    return this.mergeAndSortTokens(tokensPerProviderSupportingWanted, state);
  }

  protected mergeAndSortTokens(tokens: TokenEntity[][], state: BeefyState) {
    const mergedTokens = mergeTokenLists(...tokens);

    // Sorted by native first, then those in priorityTokens, then alphabetically
    return orderBy(
      mergedTokens,
      [
        token => (isTokenNative(token) ? 1 : 0),
        token => selectZapTokenScore(state, token.chainId, token.id),
        token => token.symbol.toLowerCase(),
      ],
      ['desc', 'desc', 'asc']
    );
  }

  protected async canSwapBetween(
    provider: ISwapProvider,
    vaultId: VaultEntity['id'],
    tokenA: TokenEntity,
    tokenB: TokenEntity,
    state: BeefyState,
    options?: StrategySwapOption
  ): Promise<boolean> {
    // Disable native<-->wnative swaps via swap aggregators, only allow wnative provider
    if (provider.getId() !== 'wnative') {
      if (isTokenNative(tokenA) || isTokenNative(tokenB)) {
        const wnative = selectChainWrappedNativeToken(state, tokenA.chainId);
        if (isTokenEqual(tokenA, wnative) || isTokenEqual(tokenB, wnative)) {
          return false;
        }
      }
    }

    const tokens = await this.providerSupportedTokens(
      provider,
      vaultId,
      tokenA.chainId,
      state,
      options
    );

    return (
      tokens.some(token => isTokenEqual(token, tokenA)) &&
      tokens.some(token => isTokenEqual(token, tokenB))
    );
  }

  async fetchQuotes(
    request: QuoteRequest,
    state: BeefyState,
    options?: StrategySwapOption
  ): Promise<QuoteResponse[]> {
    const allowedProviders = this.allowedProviders(options);
    const providerSupported = await Promise.all(
      allowedProviders.map(provider =>
        this.canSwapBetween(
          provider,
          request.vaultId,
          request.fromToken,
          request.toToken,
          state,
          options
        )
      )
    );
    const providers = this.providers.filter((_, i) => providerSupported[i]);

    if (providers.length === 0) {
      throw new Error(
        `No swap providers available for ${request.fromToken.symbol} -> ${request.toToken.symbol}`
      );
    }

    const quotes = await Promise.allSettled(
      providers.map(provider => provider.fetchQuote(request, state))
    );

    const [success, failure] = partition(quotes, isFulfilledResult);

    if (failure.length > 0) {
      console.warn(
        `Some quotes failed for ${request.fromToken.symbol} -> ${request.toToken.symbol}`
      );
      failure.forEach(failedQuote => console.warn(failedQuote.reason));
    }

    if (success.length === 0) {
      if (failure.length > 0) {
        throw failure[0].reason;
      }

      throw new Error(
        `No quotes available for ${request.fromToken.symbol} -> ${request.toToken.symbol}`
      );
    }

    return sortQuotes(success.map(quote => quote.value));
  }

  async fetchSwap(
    providerId: string,
    request: SwapRequest,
    state: BeefyState
  ): Promise<SwapResponse> {
    const provider = this.providersById[providerId];
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    return await provider.fetchSwap(request, state);
  }
}
