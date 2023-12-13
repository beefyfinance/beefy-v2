import type { ChainEntity } from '../../../entities/chain';
import type { BeefyState } from '../../../../../redux-types';
import type { TokenEntity } from '../../../entities/token';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './ISwapProvider';
import type { VaultEntity } from '../../../entities/vault';
import type { StrategySwapOption } from '../strategies/IStrategy';

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
    options?: StrategySwapOption
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
    options?: StrategySwapOption
  ): Promise<TokenSupport>;
}
