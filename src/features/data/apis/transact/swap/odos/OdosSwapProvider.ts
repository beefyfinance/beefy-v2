import { EEEE_ADDRESS } from '../../../../../../helpers/addresses';
import { fromWeiString, toWeiString } from '../../../../../../helpers/big-number';
import type { BeefyState } from '../../../../../../redux-types';
import type { ChainEntity } from '../../../../entities/chain';
import { isTokenNative, type TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains';
import { selectSupportedSwapTokensForChainAggregatorHavingPrice } from '../../../../selectors/tokens';
import { selectSwapAggregatorForChainType, selectZapByChainId } from '../../../../selectors/zap';
import type { OdosSwapSwapConfig } from '../../../config-types';
import { getOdosApi } from '../../../instances';
import { slipBy } from '../../helpers/amounts';
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
      throw new Error(`No odos aggregator config found for chain ${chain.id}`);
    }
    const zap = selectZapByChainId(state, chain.id);
    if (!zap) {
      throw new Error(`No zap found for chain ${chain.id}`);
    }

    const api = await getOdosApi(chain);
    const quote = await api.postQuote({
      inputTokens: [
        {
          tokenAddress: this.getTokenAddress(request.fromToken),
          amount: toWeiString(request.fromAmount, request.fromToken.decimals),
        },
      ],
      outputTokens: [
        {
          tokenAddress: this.getTokenAddress(request.toToken),
          proportion: 1,
        },
      ],
      chainId: chain.networkChainId,
      userAddr: zap.router,
    });

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWeiString(quote.outAmounts[0], request.toToken.decimals),
      fee: config.fee,
      extra: quote.pathId,
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
    const { quote, fromAddress, slippage } = request;
    const chain = selectChainById(state, quote.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No odos aggregator config found for chain ${chain.id}`);
    }

    const api = await getOdosApi(chain);

    const swap = await api.postSwap({
      userAddr: fromAddress,
      pathId: quote.extra as string,
      receiver: fromAddress,
    });

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: fromWeiString(swap.outputTokens[0].amount, quote.toToken.decimals),
      toAmountMin: slipBy(
        fromWeiString(swap.outputTokens[0].amount, quote.toToken.decimals),
        slippage,
        quote.toToken.decimals
      ),
      tx: {
        fromAddress: swap.transaction.from,
        toAddress: swap.transaction.to,
        data: swap.transaction.data,
        value: swap.transaction.value,
        inputPosition: -1, // not supported
      },
      fee: config.fee,
    };
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
