import { EEEE_ADDRESS } from '../../../../../../helpers/addresses.ts';
import { fromWei, toWeiString } from '../../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import { isTokenNative } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains.ts';
import { selectSupportedSwapTokensForChainAggregatorHavingPrice } from '../../../../selectors/tokens.ts';
import { selectSwapAggregatorForChainType } from '../../../../selectors/zap.ts';
import type { BeefyState } from '../../../../store/types.ts';
import type { KyberSwapSwapConfig } from '../../../config-types.ts';
import { getKyberSwapApi } from '../../../instances.ts';
import type {
  QuoteRequest as KyberQuoteRequest,
  RouteSummary,
} from '../../../kyber/kyber-types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';

export class KyberSwapProvider implements ISwapProvider {
  getId(): string {
    return 'kyber';
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? EEEE_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): KyberSwapSwapConfig | undefined {
    return selectSwapAggregatorForChainType<KyberSwapSwapConfig['type']>(state, chainId, 'kyber');
  }

  async fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse<RouteSummary>> {
    const chain = selectChainById(state, request.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No kyber aggregator config found for chain ${chain.id}`);
    }
    const api = await getKyberSwapApi(chain);
    const quoteRequest: KyberQuoteRequest = {
      tokenIn: this.getTokenAddress(request.fromToken),
      tokenOut: this.getTokenAddress(request.toToken),
      amountIn: toWeiString(request.fromAmount, request.fromToken.decimals),
      gasInclude: true,
      saveGas: false,
    };

    const quote = await api.getQuote(quoteRequest);

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWei(quote.routeSummary.amountOut, request.toToken.decimals),
      fee: config.fee,
      extra: quote.routeSummary,
    };
  }

  async fetchSwap(request: SwapRequest<RouteSummary>, state: BeefyState): Promise<SwapResponse> {
    const { quote, fromAddress, slippage } = request;
    const chain = selectChainById(state, quote.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No kyber aggregator config found for chain ${chain.id}`);
    }
    if (!quote.extra) {
      throw new Error(`No route summary found for kyber swap`);
    }

    // use a slightly reduced max slippage setting
    // this lets us accept a swap for a slightly lower amount than the original quote,
    // knowing that the min amount out is still within the original max slippage setting
    // needed as output can change between fetchQuote and fetchSwap
    const slippageTolerance = Math.trunc(slippage * 0.99 * 10_000); // 1% buffer (of slippage)
    const reducedSlippage = slippageTolerance / 10_000;

    const api = await getKyberSwapApi(chain);
    const swap = await api.postSwap({
      recipient: fromAddress,
      sender: fromAddress,
      routeSummary: quote.extra,
      slippageTolerance, // in bps (1/10_000)
    });

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: fromWei(swap.amountOut, quote.toToken.decimals),
      toAmountMin: slipBy(
        fromWei(swap.amountOut, quote.toToken.decimals),
        reducedSlippage,
        quote.toToken.decimals
      ),
      tx: {
        fromAddress: fromAddress,
        toAddress: swap.routerAddress,
        data: swap.data,
        value: isTokenNative(quote.fromToken) ? quote.extra.amountIn : '0',
        inputPosition: -1, // not supported
      },
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
      'kyber'
    );
    return config.blockedTokens.length ?
        possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
