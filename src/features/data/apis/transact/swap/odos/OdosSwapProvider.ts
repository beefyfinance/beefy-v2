import { EEEE_ADDRESS } from '../../../../../../helpers/addresses';
import { fromWeiString, toWeiString } from '../../../../../../helpers/big-number';
import type { BeefyState } from '../../../../../../redux-types';
import type { ChainEntity } from '../../../../entities/chain';
import { isTokenNative, type TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains';
import { selectSupportedSwapTokensForChainAggregatorHavingPrice } from '../../../../selectors/tokens';
import { selectSwapAggregatorForChainType } from '../../../../selectors/zap';
import type { OdosSwapSwapConfig } from '../../../config-types';
import { getOdosApi } from '../../../instances';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider';

export class OdosSwapProvider implements ISwapProvider {
  getId(): string {
    return 'odos';
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? EEEE_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): OdosSwapSwapConfig | undefined {
    return selectSwapAggregatorForChainType<OdosSwapSwapConfig['type']>(state, chainId, 'odos');
  }

  async fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse> {
    const chain = selectChainById(state, request.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No one-inch aggregator config found for chain ${chain.id}`);
    }

    const api = await getOdosApi(chain);
    const quote = await api.getQuote({
      src: this.getTokenAddress(request.fromToken),
      dst: this.getTokenAddress(request.toToken),
      amount: toWeiString(request.fromAmount, request.fromToken.decimals),
      fee: (config.fee.value * 100).toString(10), // convert to % (0.0005 -> 0.05%)
    });

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWeiString(quote.dstAmount, request.toToken.decimals),
      fee: config.fee,
    };
  }

  async getSupportedTokens(
    vaultId: VaultEntity['id'],
    chainId: ChainEntity['id'],
    state: BeefyState
  ): Promise<TokenEntity[]> {
    const config = this.getConfigForChain(chainId, state);
    if (!config) {
      return [];
    }

    if (config.blockedVaults.includes(vaultId)) {
      return [];
    }
    const possibleTokens = selectSupportedSwapTokensForChainAggregatorHavingPrice(
      state,
      chainId,
      'odos'
    );
    return config.blockedTokens.length
      ? possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse> {
    throw new Error('Method not implemented.');
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
