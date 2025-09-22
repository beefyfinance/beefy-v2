import { ZERO_ADDRESS } from '../../../../../../helpers/addresses.ts';
import { fromWei, toWeiString } from '../../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import { isTokenNative, type TokenEntity } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains.ts';
import { selectSupportedSwapTokensForChainAggregatorHavingPrice } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectSwapAggregatorForChainType, selectZapByChainId } from '../../../../selectors/zap.ts';
import type { BeefyState } from '../../../../store/types.ts';
import type { OdosSwapConfig } from '../../../config-types.ts';
import { getOdosApi } from '../../../instances.ts';
import { slipBy } from '../../helpers/amounts.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';

export class OdosSwapProvider implements ISwapProvider {
  getId(): string {
    return 'odos';
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? ZERO_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): OdosSwapConfig | undefined {
    return selectSwapAggregatorForChainType<OdosSwapConfig['type']>(state, chainId, 'odos');
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

    const slippage = selectTransactSlippage(state);
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
      slippageLimitPercent: slippage * 100,
      simple: true,
    });

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWei(quote.outAmounts[0], request.toToken.decimals),
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
    return config.blockedTokens.length ?
        possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
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
      toAmount: fromWei(swap.outputTokens[0].amount, quote.toToken.decimals),
      toAmountMin: slipBy(
        fromWei(swap.outputTokens[0].amount, quote.toToken.decimals),
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
