import { type Abi, encodeFunctionData } from 'viem';
import { toWeiString } from '../../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import { isTokenNative } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { selectAllChainIds } from '../../../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
} from '../../../../selectors/tokens.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { ZERO_FEE } from '../../helpers/quotes.ts';
import { floorToSharedPrecision, nativeAndWrappedAreSame } from '../../helpers/tokens.ts';
import { getInsertIndex } from '../../helpers/zap.ts';
import type {
  ISwapProvider,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from '../ISwapProvider.ts';

export class WNativeSwapProvider implements ISwapProvider {
  getId(): string {
    return 'wnative';
  }

  async fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse> {
    const { fromToken, fromAmount } = request;
    // 1:1, but on same-balance chains the wnative view may hold fewer decimals
    const toAmount =
      nativeAndWrappedAreSame(fromToken.chainId) ?
        floorToSharedPrecision(
          fromAmount,
          fromToken,
          selectChainWrappedNativeToken(state, fromToken.chainId)
        )
      : fromAmount;
    return {
      providerId: this.getId(),
      fromToken,
      fromAmount,
      toToken: request.toToken,
      toAmount,
      fee: ZERO_FEE,
    };
  }

  async fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse> {
    const { quote } = request;
    const chainId = quote.fromToken.chainId;
    if (nativeAndWrappedAreSame(chainId)) {
      // fetchZapAggregatorSwap moves these call-less; wnative may have no deposit()/withdraw()
      throw new Error(`No wrap/unwrap call on ${chainId}`);
    }
    const wnative = selectChainWrappedNativeToken(state, chainId);
    const inputIsNative = isTokenNative(quote.fromToken);
    const fromAmountWei = toWeiString(quote.fromAmount, quote.fromToken.decimals);

    return {
      providerId: this.getId(),
      fromToken: quote.fromToken,
      fromAmount: quote.fromAmount,
      toToken: quote.toToken,
      toAmount: quote.fromAmount,
      toAmountMin: quote.fromAmount, // no slippage
      tx: {
        fromAddress: request.fromAddress,
        toAddress: wnative.address,
        data: inputIsNative ? this.encodeWrapCall() : this.encodeUnwrapCall(fromAmountWei),
        value: inputIsNative ? fromAmountWei : '0',
        inputPosition: inputIsNative ? -1 : getInsertIndex(0),
      },
      fee: ZERO_FEE,
    };
  }

  async getSupportedTokens(
    _vaultId: VaultEntity['id'] | undefined,
    chainId: ChainEntity['id'],
    state: BeefyState
  ): Promise<TokenEntity[]> {
    const native = selectChainNativeToken(state, chainId);
    const wnative = selectChainWrappedNativeToken(state, chainId);
    return [native, wnative];
  }

  protected encodeWrapCall(): string {
    return encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'deposit',
          constant: false,
          stateMutability: 'payable',
          payable: true,
          inputs: [],
          outputs: [],
        },
      ] as const satisfies Abi,
    });
  }

  protected encodeUnwrapCall(amountWei: string): string {
    return encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'withdraw',
          constant: false,
          payable: false,
          stateMutability: 'nonpayable',
          inputs: [{ type: 'uint256', name: 'wad' }],
          outputs: [],
        },
      ] as const satisfies Abi,
      args: [BigInt(amountWei)],
    });
  }

  async getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]> {
    return selectAllChainIds(state);
  }
}
