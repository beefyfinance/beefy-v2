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
import { getOneInchApi } from '../../../instances';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains';
import { fromWeiString, toWeiString } from '../../../../../../helpers/big-number';
import { EEEE_ADDRESS } from '../../../../../../helpers/addresses';
import { selectSwapAggregatorForChainType } from '../../../../selectors/zap';
import type { OneInchSwapConfig } from '../../../config-types';
import type { VaultEntity } from '../../../../entities/vault';
import { slipBy } from '../../helpers/amounts';

export class OneInchSwapProvider implements ISwapProvider {
  getId(): string {
    return 'one-inch';
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? EEEE_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): OneInchSwapConfig | undefined {
    return selectSwapAggregatorForChainType<OneInchSwapConfig>(state, chainId, 'one-inch');
  }

  async fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse> {
    const chain = selectChainById(state, request.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No one-inch aggregator config found for chain ${chain.id}`);
    }

    const api = await getOneInchApi(chain);
    const quote = await api.getQuote({
      src: this.getTokenAddress(request.fromToken),
      dst: this.getTokenAddress(request.toToken),
      amount: toWeiString(request.fromAmount, request.fromToken.decimals),
      fee: config.fee.value.toString(10),
    });

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWeiString(quote.toAmount, request.toToken.decimals),
      fee: config.fee,
    };
  }

  async fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse> {
    const { quote, fromAddress, slippage } = request;
    const chain = selectChainById(state, quote.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No one-inch aggregator config found for chain ${chain.id}`);
    }

    const api = await getOneInchApi(chain);
    const swap = await api.getSwap({
      from: fromAddress,
      src: this.getTokenAddress(quote.fromToken),
      dst: this.getTokenAddress(quote.toToken),
      amount: toWeiString(quote.fromAmount, quote.fromToken.decimals),
      slippage: request.slippage * 100,
      disableEstimate: true,
      fee: config.fee.value.toString(10),
      referrer: config.fee.recipient,
    });

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: fromWeiString(swap.toAmount, quote.toToken.decimals),
      toAmountMin: slipBy(
        fromWeiString(swap.toAmount, quote.toToken.decimals),
        slippage,
        quote.toToken.decimals
      ),
      tx: {
        fromAddress: swap.tx.from,
        toAddress: swap.tx.to,
        data: swap.tx.data,
        value: swap.tx.value,
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
      'one-inch'
    );
    return config.blockedTokens.length
      ? possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
