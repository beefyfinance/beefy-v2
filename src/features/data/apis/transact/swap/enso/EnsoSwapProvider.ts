import { decodeAbiParameters, decodeFunctionData, type Hex } from 'viem';
import { EnsoRouterAbi } from '../../../../../../config/abi/EnsoRouterAbi.ts';
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
import type { EnsoSwapConfig } from '../../../config-types.ts';
import type { SwapTx as EnsoSwapTx } from '../../../enso/enso-types.ts';
import { getEnsoApi } from '../../../instances.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { QuoteChangedError } from '../../strategies/error.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';

// enso rejects the checksummed form
const ENSO_NATIVE_ADDRESS = EEEE_ADDRESS.toLowerCase();

const TOKEN_TYPE_NATIVE = 0;
const TOKEN_TYPE_ERC20 = 1;

const DEFAULT_QUOTE_TIMEOUT_MS = 2500;

export class EnsoSwapProvider implements ISwapProvider {
  getId(): string {
    return 'enso';
  }

  protected getTokenAddress(token: TokenEntity): string {
    return isTokenNative(token) ? ENSO_NATIVE_ADDRESS : token.address;
  }

  protected getConfigForChain(
    chainId: ChainEntity['id'],
    state: BeefyState
  ): EnsoSwapConfig | undefined {
    return selectSwapAggregatorForChainType<EnsoSwapConfig['type']>(state, chainId, 'enso');
  }

  async fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse> {
    // enso can ignore aggregators/standards but has no rfq flag, and aggregator legs may still fill via rfq
    if (request.options?.excludeRfq) {
      throw new Error('enso cannot exclude RFQ sources');
    }

    const chain = selectChainById(state, request.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No enso aggregator config found for chain ${chain.id}`);
    }

    const api = await getEnsoApi(chain);
    const quote = await api.getQuote(
      {
        tokenIn: this.getTokenAddress(request.fromToken),
        tokenOut: this.getTokenAddress(request.toToken),
        amountIn: toWeiString(request.fromAmount, request.fromToken.decimals),
        ...(config.excludedSources?.length ?
          { ignoreAggregators: config.excludedSources.join(',') }
        : {}),
      },
      config.quoteTimeoutMs ?? DEFAULT_QUOTE_TIMEOUT_MS
    );

    return {
      providerId: this.getId(),
      fromToken: request.fromToken,
      fromAmount: request.fromAmount,
      toToken: request.toToken,
      toAmount: fromWei(quote.amountOut, request.toToken.decimals),
      fee: quote.extra.fee,
    };
  }

  async fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse> {
    const { quote, fromAddress, slippage } = request;
    const chain = selectChainById(state, quote.fromToken.chainId);
    const config = this.getConfigForChain(chain.id, state);
    if (!config) {
      throw new Error(`No enso aggregator config found for chain ${chain.id}`);
    }

    // enso re-quotes on /swap, so ask for the min amount based on original quote rather than slippage%
    const minAmountOut = slipBy(quote.toAmount, slippage, quote.toToken.decimals);
    const amountIn = toWeiString(quote.fromAmount, quote.fromToken.decimals);
    const api = await getEnsoApi(chain);
    const swap = await api.getSwap({
      tokenIn: this.getTokenAddress(quote.fromToken),
      tokenOut: this.getTokenAddress(quote.toToken),
      amountIn,
      fromAddress,
      minAmountOut: toWeiString(minAmountOut, quote.toToken.decimals),
      ...(config.excludedSources?.length ?
        { ignoreAggregators: config.excludedSources.join(',') }
      : {}),
    });

    this.validateSwapTx(swap.tx, config, quote.fromToken, amountIn);

    const toAmountMin = fromWei(swap.minAmountOut, quote.toToken.decimals);
    if (toAmountMin.lt(minAmountOut)) {
      throw new Error(
        `enso swap minimum ${toAmountMin.toString(10)} is below the requested ${minAmountOut.toString(10)}`
      );
    }

    // the min is not derived from the re-quote, so the route could already be below it and revert
    const toAmount = fromWei(swap.amountOut, quote.toToken.decimals);
    if (toAmount.lt(toAmountMin)) {
      throw new QuoteChangedError(
        `enso swap output ${toAmount.toString(10)} is below the minimum ${toAmountMin.toString(10)}`
      );
    }

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
        inputPosition: -1, // unsafe: the amount is repeated throughout the calldata
        exactValue: true, // enso does not check msg.value, any excess native would be stranded
      },
      fee: quote.fee,
    };
  }

  /** the calldata must pull exactly the quoted input, as we do not insert the balance */
  protected validateSwapTx(
    tx: EnsoSwapTx,
    config: EnsoSwapConfig,
    fromToken: TokenEntity,
    amountIn: string
  ) {
    if (tx.to.toLowerCase() !== config.routerAddress.toLowerCase()) {
      throw new Error(`enso swap target ${tx.to} is not the enso router ${config.routerAddress}`);
    }

    // throws unless the selector is routeSingle
    const { args } = decodeFunctionData({
      abi: EnsoRouterAbi,
      data: tx.data as Hex,
    });

    const [{ tokenType, data }] = args;
    const expectedAmount = BigInt(amountIn);
    let amount: bigint;
    let value: string;

    if (isTokenNative(fromToken)) {
      if (tokenType !== TOKEN_TYPE_NATIVE) {
        throw new Error(`enso swap token type ${tokenType} is not native`);
      }
      // native data holds only the amount
      [amount] = decodeAbiParameters([{ type: 'uint256' }], data);
      value = amountIn;
    } else {
      if (tokenType !== TOKEN_TYPE_ERC20) {
        throw new Error(`enso swap token type ${tokenType} is not erc20`);
      }
      let token: string;
      [token, amount] = decodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], data);
      if (token.toLowerCase() !== fromToken.address.toLowerCase()) {
        throw new Error(`enso swap input token ${token} does not match ${fromToken.address}`);
      }
      value = '0';
    }

    if (amount !== expectedAmount) {
      throw new Error(`enso swap input amount ${amount} does not match ${amountIn}`);
    }
    if (BigInt(tx.value) !== BigInt(value)) {
      throw new Error(`enso swap value ${tx.value} does not match ${value}`);
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
      'enso'
    );
    return config.blockedTokens.length ?
        possibleTokens.filter(token => !config.blockedTokens.includes(token.id))
      : possibleTokens;
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state).filter(chainId => !!this.getConfigForChain(chainId, state));
  }
}
