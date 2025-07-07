import { EEEE_ADDRESS } from '../../../../../../helpers/addresses.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import { isTokenNative } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { selectAllChainIds, selectChainById } from '../../../../selectors/chains.ts';
import { selectSupportedSwapTokensForChainAggregatorHavingPrice } from '../../../../selectors/tokens.ts';
import { selectSwapAggregatorForChainType } from '../../../../selectors/zap.ts';
import type { BeefyState } from '../../../../store/types.ts';
import type { LiquidSwapSwapConfig } from '../../../config-types.ts';
import { getLiquidSwapApi } from '../../../instances.ts';
import type {
  QuoteExecution,
  QuoteRequest as LiquidSwapQuoteRequest,
} from '../../../liquid-swap/liquid-swap-types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { toWeiString } from '../../../../../../helpers/big-number.ts';
import BigNumber from 'bignumber.js';

export class LiquidSwapSwapProvider implements ISwapProvider {
  getId(): string {
    return 'liquid-swap';
  }

  async fetchQuote(
    request: QuoteRequest,
    state: BeefyState
  ): Promise<QuoteResponse<QuoteExecution>> {
    const chain = selectChainById(state, request.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No LiquidSwap aggregator config found for chain ${chain.id}`);
    }
    const slippage = selectTransactSlippage(state);
    const api = await getLiquidSwapApi(chain);
    const quoteRequest: LiquidSwapQuoteRequest = {
      tokenIn: this.getTokenAddress(request.fromToken),
      tokenOut: this.getTokenAddress(request.toToken),
      amountIn: request.fromAmount.toString(10), // @dev in decimal, not converted to wei
      multiHop: true,
      slippage: slippage * 100, // 0.01 -> 1%
    };

    const quote = await api.getQuote(quoteRequest);

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: new BigNumber(quote.amountOut), // @dev in decimal, no need to convert from wei
      fee: config.fee,
      extra: quote.execution,
    };
  }

  async fetchSwap(request: SwapRequest<QuoteExecution>, state: BeefyState): Promise<SwapResponse> {
    const { quote, fromAddress, slippage } = request;
    const chain = selectChainById(state, quote.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No LiquidSwap aggregator config found for chain ${chain.id}`);
    }
    if (!quote.extra) {
      throw new Error(`No route summary found for LiquidSwap swap`);
    }
    const api = await getLiquidSwapApi(chain);
    const swap = await api.postSwap({
      tokenIn: this.getTokenAddress(quote.fromToken),
      tokenOut: this.getTokenAddress(quote.toToken),
      amountIn: quote.fromAmount.toString(10), // @dev in decimal, not converted to wei
      multiHop: true,
      slippage: slippage * 100, // 0.01 -> 1%
    });

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: new BigNumber(swap.amountOut), // @dev in decimal, no need to convert from wei
      toAmountMin: slipBy(
        new BigNumber(swap.amountOut), // @dev in decimal, no need to convert from wei
        slippage,
        quote.toToken.decimals
      ),
      tx: {
        fromAddress: fromAddress,
        toAddress: swap.execution.to,
        data: swap.execution.calldata,
        value:
          isTokenNative(quote.fromToken) ?
            toWeiString(quote.fromAmount, quote.fromToken.decimals)
          : '0',
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
      'liquid-swap'
    );
    return config.blockedTokens.length ?
        possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? EEEE_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): LiquidSwapSwapConfig | undefined {
    return selectSwapAggregatorForChainType<LiquidSwapSwapConfig['type']>(
      state,
      chainId,
      'liquid-swap'
    );
  }
}
