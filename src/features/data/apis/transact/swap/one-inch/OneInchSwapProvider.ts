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
import type { OneInchSwapConfig } from '../../../config-types.ts';
import { getOneInchApi } from '../../../instances.ts';
import { slipBy } from '../../helpers/amounts.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';

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
    return selectSwapAggregatorForChainType<OneInchSwapConfig['type']>(state, chainId, 'one-inch');
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
    });

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWei(quote.dstAmount, request.toToken.decimals),
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
      slippage: request.slippage * 100, // convert to % (0.01 -> 1%)
      disableEstimate: true,
    });

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: fromWei(swap.dstAmount, quote.toToken.decimals),
      toAmountMin: slipBy(
        fromWei(swap.dstAmount, quote.toToken.decimals),
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
    return config.blockedTokens.length ?
        possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
