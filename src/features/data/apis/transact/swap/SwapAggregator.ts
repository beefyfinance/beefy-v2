import { partition } from 'lodash-es';
import { isFulfilledResult } from '../../../../../helpers/promises.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import { isTokenEqual, isTokenNative, tokenEqualityKey } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens.ts';
import { selectZapTokenScore } from '../../../selectors/zap.ts';
import type { BeefyState } from '../../../store/types.ts';
import { sortQuotes } from '../helpers/quotes.ts';
import { mergeTokenLists } from '../helpers/tokens.ts';
import type { StrategySwapConfig } from '../strategies/strategy-configs.ts';
import type { ISwapAggregator, TokenSupport } from './ISwapAggregator.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './ISwapProvider.ts';

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

  protected allowedProviders(options: StrategySwapConfig | undefined) {
    const blockedProviders: string[] = options?.blockProviders || [];

    if (blockedProviders.length === 0) {
      return this.providers;
    }

    return this.providers.filter(provider => !blockedProviders.includes(provider.getId()));
  }

  protected allowedTokens(tokens: TokenEntity[], options: StrategySwapConfig | undefined) {
    const blockedTokens: string[] = options?.blockTokens || [];

    if (blockedTokens.length === 0) {
      return tokens;
    }

    return tokens.filter(token => !blockedTokens.includes(token.id));
  }

  protected async providerSupportedTokens(
    provider: ISwapProvider,
    vaultId: VaultEntity['id'] | undefined,
    chainId: ChainEntity['id'],
    state: BeefyState,
    options: StrategySwapConfig | undefined
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
    vaultId: VaultEntity['id'] | undefined,
    chainId: ChainEntity['id'],
    state: BeefyState,
    options?: StrategySwapConfig
  ): Promise<TokenSupport> {
    const allowedProviders = this.allowedProviders(options);
    const tokensPerProvider = await Promise.all(
      allowedProviders.map(provider =>
        this.providerSupportedTokens(provider, vaultId, chainId, state, options)
      )
    );

    // membership index per provider, so the per-wanted-token tests below are hash lookups
    // rather than a scan of every provider list for every wanted token
    const keysPerProvider = tokensPerProvider.map(
      providerTokens => new Set(providerTokens.map(tokenEqualityKey))
    );
    const wantedKeys = wantedTokens.map(tokenEqualityKey);

    // the merged+sorted list depends only on which providers passed, and the same subset recurs
    // for most wanted tokens, so merge and sort each distinct subset once
    const mergedBySubset = new Map<string, TokenEntity[]>();
    const tokensSupporting = (supports: (providerIndex: number) => boolean): TokenEntity[] => {
      const passing: TokenEntity[][] = [];
      const subsetKey: number[] = [];
      for (let i = 0; i < tokensPerProvider.length; ++i) {
        if (tokensPerProvider[i].length > 1 && supports(i)) {
          passing.push(tokensPerProvider[i]);
          subsetKey.push(i);
        }
      }

      const cacheKey = subsetKey.join(',');
      let merged = mergedBySubset.get(cacheKey);
      if (merged === undefined) {
        merged = this.mergeAndSortTokens(passing, state);
        mergedBySubset.set(cacheKey, merged);
      }
      return merged;
    };

    const supportPerWanted = wantedKeys.map(wantedKey =>
      tokensSupporting(i => keysPerProvider[i].has(wantedKey))
    );

    if (supportPerWanted.length === 1) {
      return {
        tokens: supportPerWanted,
        any: supportPerWanted[0],
      };
    }

    const supportAny = tokensSupporting(i =>
      wantedKeys.some(wantedKey => keysPerProvider[i].has(wantedKey))
    );

    return {
      tokens: supportPerWanted,
      any: supportAny,
    };
  }

  protected mergeAndSortTokens(tokens: TokenEntity[][], state: BeefyState) {
    // Sorted by native first, then those in priorityTokens, then alphabetically.
    // Keys are computed once per token rather than per comparison.
    const ranked = mergeTokenLists(...tokens).map(token => ({
      token,
      native: isTokenNative(token) ? 1 : 0,
      score: selectZapTokenScore(state, token.chainId, token.id),
      symbol: token.symbol.toLowerCase(),
    }));

    ranked.sort(
      (a, b) =>
        b.native - a.native ||
        b.score - a.score ||
        (a.symbol < b.symbol ? -1
        : a.symbol > b.symbol ? 1
        : 0)
    );

    return ranked.map(({ token }) => token);
  }

  async canSwapTokenPair(
    fromToken: TokenEntity,
    toToken: TokenEntity,
    vaultId: VaultEntity['id'] | undefined,
    chainId: ChainEntity['id'],
    state: BeefyState,
    options?: StrategySwapConfig
  ): Promise<boolean> {
    const allowedProviders = this.allowedProviders(options);
    const tokensPerProvider = await Promise.all(
      allowedProviders.map(provider =>
        this.providerSupportedTokens(provider, vaultId, chainId, state, options)
      )
    );
    return tokensPerProvider.some(
      providerTokens =>
        providerTokens.length > 1 &&
        providerTokens.some(t => isTokenEqual(t, fromToken)) &&
        providerTokens.some(t => isTokenEqual(t, toToken))
    );
  }

  protected async canSwapBetween(
    provider: ISwapProvider,
    vaultId: VaultEntity['id'] | undefined,
    tokenA: TokenEntity,
    tokenB: TokenEntity,
    state: BeefyState,
    options?: StrategySwapConfig
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
    options?: StrategySwapConfig
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
    const providers = allowedProviders.filter((_, i) => providerSupported[i]);

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

    const result = await provider.fetchSwap(request, state);
    return result;
  }
}
