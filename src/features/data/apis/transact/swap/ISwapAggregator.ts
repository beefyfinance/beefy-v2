import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { StrategySwapConfig } from '../strategies/strategy-configs.ts';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './ISwapProvider.ts';

export type TokenSupport = {
  /** Tokens supported per input token */
  tokens: TokenEntity[][];
  /** Tokens supported for any input token */
  any: TokenEntity[];
};

export interface ISwapAggregator {
  /**
   * Returns quotes for a request
   * Optionally, some providers or tokens can be disabled
   */
  fetchQuotes(
    request: QuoteRequest,
    state: BeefyState,
    options?: StrategySwapConfig
  ): Promise<QuoteResponse[]>;

  /**
   * Returns a swap incl tx data for a request on a specific provider
   */
  fetchSwap(providerId: string, request: SwapRequest, state: BeefyState): Promise<SwapResponse>;

  /**
   * Returns tokens supported for each input token
   * Optionally, some providers or tokens can be disabled
   */
  fetchTokenSupport(
    tokens: TokenEntity[],
    vaultId: VaultEntity['id'],
    chainId: ChainEntity['id'],
    state: BeefyState,
    options?: StrategySwapConfig
  ): Promise<TokenSupport>;
}
