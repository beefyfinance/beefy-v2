import { padHex, toHex } from 'viem';
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
import type { OkxSwapConfig } from '../../../config-types.ts';
import type { SwapResponse as OkxSwapResponse } from '../../../okx/okx-types.ts';
import { getOkxApi } from '../../../instances.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { QuoteChangedError } from '../../strategies/error.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';

const OKX_NATIVE_ADDRESS = EEEE_ADDRESS.toLowerCase();
// okx sets the calldata deadline 1h after the swap is built
const OKX_DEADLINE_SECONDS = 60 * 60;

type OkxQuoteExtra = { excludeRfq: boolean };

export class OkxSwapProvider implements ISwapProvider {
  getId(): string {
    return 'okx';
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? OKX_NATIVE_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): OkxSwapConfig | undefined {
    return selectSwapAggregatorForChainType<OkxSwapConfig['type']>(state, chainId, 'okx');
  }

  async fetchQuote(
    request: QuoteRequest,
    state: BeefyState
  ): Promise<QuoteResponse<OkxQuoteExtra>> {
    const excludeRfq = !!request.options?.excludeRfq;
    const chain = selectChainById(state, request.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No okx aggregator config found for chain ${chain.id}`);
    }

    const api = await getOkxApi(chain);
    const quote = await api.getQuote({
      tokenIn: this.getTokenAddress(request.fromToken),
      tokenOut: this.getTokenAddress(request.toToken),
      amountIn: toWeiString(request.fromAmount, request.fromToken.decimals),
      ...(excludeRfq ? { excludeRfq: 'true' as const } : {}),
    });

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWei(quote.toTokenAmount, request.toToken.decimals),
      fee: quote.extra.fee,
      extra: { excludeRfq },
    };
  }

  async fetchSwap(request: SwapRequest<OkxQuoteExtra>, state: BeefyState): Promise<SwapResponse> {
    const { quote, fromAddress, slippage, options } = request;
    if (options?.deadlineSeconds && options.deadlineSeconds > OKX_DEADLINE_SECONDS) {
      throw new Error(`okx calldata expires after ${OKX_DEADLINE_SECONDS}s`);
    }

    const chain = selectChainById(state, quote.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No okx aggregator config found for chain ${chain.id}`);
    }

    // okx re-quotes on /swap and derives its min from that, so half the slippage lets the
    // re-quote drop by ~half before its min falls below the user's; whole bps for the api
    const slippageBps = Math.trunc(slippage * 0.5 * 10_000);
    if (slippageBps <= 0) {
      throw new Error(`okx slippage ${slippage} is too low`);
    }

    const minAmountOut = slipBy(quote.toAmount, slippage, quote.toToken.decimals);
    const amountIn = toWeiString(quote.fromAmount, quote.fromToken.decimals);
    const api = await getOkxApi(chain);
    const swap = await api.getSwap({
      tokenIn: this.getTokenAddress(quote.fromToken),
      tokenOut: this.getTokenAddress(quote.toToken),
      amountIn,
      fromAddress,
      slippage: (slippageBps / 10_000).toFixed(4),
      minAmountOut: toWeiString(minAmountOut, quote.toToken.decimals),
      // okx re-quotes on /swap, so the quote's RFQ exclusion must be repeated
      ...(quote.extra?.excludeRfq ? { excludeRfq: 'true' as const } : {}),
    });

    this.validateSwap(swap, config, quote.fromToken, amountIn);

    const toAmountMin = fromWei(swap.minToAmount, quote.toToken.decimals);
    if (toAmountMin.lt(minAmountOut)) {
      throw new QuoteChangedError(
        `okx swap minimum ${toAmountMin.toString(10)} is below the requested ${minAmountOut.toString(10)}`
      );
    }

    // okx re-quotes on /swap, the route could already be below the min and revert
    const toAmount = fromWei(swap.toAmount, quote.toToken.decimals);
    if (toAmount.lt(toAmountMin)) {
      throw new QuoteChangedError(
        `okx swap output ${toAmount.toString(10)} is below the minimum ${toAmountMin.toString(10)}`
      );
    }

    const isFromNative = isTokenNative(quote.fromToken);

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount,
      toAmountMin,
      tx: {
        fromAddress,
        toAddress: swap.tx.to,
        data: swap.tx.data,
        value: swap.tx.value,
        inputPosition: -1, // unsafe: the amount may be packed with other data
        exactValue: true,
        approvalAddress: isFromNative ? undefined : config.approveAddress,
      },
      fee: quote.fee,
    };
  }

  /** the calldata must pull exactly the quoted input, as we do not insert the balance */
  protected validateSwap(
    swap: OkxSwapResponse,
    config: OkxSwapConfig,
    fromToken: TokenEntity,
    amountIn: string
  ) {
    const { tx, approveAddress } = swap;
    if (tx.to.toLowerCase() !== config.routerAddress.toLowerCase()) {
      throw new Error(`okx swap target ${tx.to} is not the okx router ${config.routerAddress}`);
    }

    if (isTokenNative(fromToken)) {
      if (approveAddress) {
        throw new Error(`okx swap from native should not need approval of ${approveAddress}`);
      }
      if (BigInt(tx.value) !== BigInt(amountIn)) {
        throw new Error(`okx swap value ${tx.value} does not match ${amountIn}`);
      }
    } else {
      if (!approveAddress || approveAddress.toLowerCase() !== config.approveAddress.toLowerCase()) {
        throw new Error(
          `okx swap approval ${approveAddress} is not the okx approval ${config.approveAddress}`
        );
      }
      if (BigInt(tx.value) !== 0n) {
        throw new Error(`okx swap value ${tx.value} should be 0`);
      }
    }

    // the router has many entry points, so look for the amount as any whole argument word
    const amountWord = padHex(toHex(BigInt(amountIn)), { size: 32 }).slice(2);
    const args = tx.data.toLowerCase().slice(10);
    let found = false;
    for (let i = 0; i + 64 <= args.length; i += 64) {
      if (args.slice(i, i + 64) === amountWord) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`okx swap calldata does not contain input amount ${amountIn}`);
    }
  }

  async getSupportedTokens(
    vaultId: VaultEntity['id'] | undefined,
    chainId: ChainEntity['id'],
    state: BeefyState
  ): Promise<TokenEntity[]> {
    const config = this.getConfigForChain(chainId, state);
    if (!config) {
      return [];
    }

    if (vaultId && config.blockedVaults.includes(vaultId)) {
      return [];
    }

    const possibleTokens = selectSupportedSwapTokensForChainAggregatorHavingPrice(
      state,
      chainId,
      'okx'
    );
    return config.blockedTokens.length ?
        possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
