import type { BeefyState } from '../../../../../../redux-types';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider';
import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import { isTokenNative } from '../../../../entities/token';
import { selectSupportedSwapTokensForChainAggregatorHavingPrice } from '../../../../selectors/tokens';
import { getKyberSwapApi } from '../../../instances';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains';
import { fromWeiString, toWeiString } from '../../../../../../helpers/big-number';
import { EEEE_ADDRESS } from '../../../../../../helpers/addresses';
import { selectSwapAggregatorForChainType } from '../../../../selectors/zap';
import type { KyberSwapSwapConfig } from '../../../config-types';
import type { VaultEntity } from '../../../../entities/vault';
import { slipBy } from '../../helpers/amounts';
import type { RouteSummary, QuoteRequest as KyberQuoteRequest } from '../../../kyber/kyber-types';

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
    return selectSwapAggregatorForChainType<KyberSwapSwapConfig>(state, chainId, 'kyber');
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

    if (config.fee && config.fee.value > 0) {
      quoteRequest.feeAmount = (config.fee.value * 10000).toString(10); // convert to bps (0.0005 -> 5bps aka 0.05%)
      quoteRequest.isInBps = true;
      quoteRequest.chargeFeeBy = 'currency_in';
      quoteRequest.feeReceiver = config.fee.recipient;
    }

    const quote = await api.getQuote(quoteRequest);

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWeiString(quote.routeSummary.amountOut, request.toToken.decimals),
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
    const api = await getKyberSwapApi(chain);
    const swap = await api.postSwap({
      recipient: fromAddress,
      sender: fromAddress,
      routeSummary: quote.extra,
      slippageTolerance: slippage * 10000, // convert to bps (0.0005 -> 5bps = 0.05%)
    });

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: fromWeiString(swap.amountOut, quote.toToken.decimals),
      toAmountMin: slipBy(
        fromWeiString(swap.amountOut, quote.toToken.decimals),
        slippage,
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
    return config.blockedTokens.length
      ? possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
