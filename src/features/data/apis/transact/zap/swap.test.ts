import { decodeFunctionData } from 'viem';
import { describe, expect, it } from 'vitest';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import {
  baseNative,
  baseUsdc,
  baseWeth,
  bn,
  makeState,
} from '../helpers/same-balance.test-helper.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import type { QuoteResponse, SwapResponse, SwapTx } from '../swap/ISwapProvider.ts';
import { fetchZapAggregatorSwap } from './swap.ts';

const ZAP_ROUTER = '0xaEFB7C930b9181A31a0CDF0409375b78C059395C';
const SWAP_ROUTER = '0x1111111111111111111111111111111111111111';
const SPENDER = '0x2222222222222222222222222222222222222222';
const state = makeState();

const erc20Quote: QuoteResponse = {
  providerId: 'test',
  fromToken: baseUsdc,
  fromAmount: bn('12.345678'),
  toToken: baseWeth,
  toAmount: bn('0.005'),
  fee: { value: 0 },
};

const nativeQuote: QuoteResponse = {
  providerId: 'test',
  fromToken: baseNative,
  fromAmount: bn('0.01'),
  toToken: baseUsdc,
  toAmount: bn('25'),
  fee: { value: 0 },
};

async function zapSwap(
  tx: Partial<SwapTx>,
  insertBalance: boolean,
  quote: QuoteResponse = erc20Quote
) {
  const swap: SwapResponse = {
    ...quote,
    toAmountMin: quote.toAmount,
    tx: {
      fromAddress: ZAP_ROUTER,
      toAddress: SWAP_ROUTER,
      data: '0x12345678',
      value: '0',
      inputPosition: 4,
      ...tx,
    },
  };
  const aggregator = { fetchSwap: async () => swap } as unknown as ISwapAggregator;
  return fetchZapAggregatorSwap(
    {
      quote,
      providerId: quote.providerId,
      inputs: [{ token: quote.fromToken, amount: quote.fromAmount }],
      outputs: [{ token: quote.toToken, amount: quote.toAmount }],
      maxSlippage: 0.01,
      zapRouter: ZAP_ROUTER,
      insertBalance,
    },
    aggregator,
    state
  );
}

describe('fetchZapAggregatorSwap', () => {
  it('resets then approves a separate spender for the exact input before the swap', async () => {
    const result = await zapSwap({ inputPosition: -1, approvalAddress: SPENDER }, true);

    expect(result.zaps).toHaveLength(3);
    const [reset, approve, swap] = result.zaps;
    for (const step of [reset, approve]) {
      expect(step.target).toBe(baseUsdc.address);
      expect(step.value).toBe('0');
      expect(step.tokens).toEqual([]);
    }
    const decodedReset = decodeFunctionData({ abi: ERC20Abi, data: reset.data as `0x${string}` });
    expect(decodedReset.functionName).toBe('approve');
    expect(decodedReset.args).toEqual([SPENDER, 0n]);
    const decoded = decodeFunctionData({ abi: ERC20Abi, data: approve.data as `0x${string}` });
    expect(decoded.functionName).toBe('approve');
    expect(decoded.args).toEqual([SPENDER, 12345678n]);
    expect(swap).toEqual({ target: SWAP_ROUTER, data: '0x12345678', value: '0', tokens: [] });
  });

  it('approves the swap target when there is no separate spender', async () => {
    const result = await zapSwap({}, true);

    expect(result.zaps).toEqual([
      {
        target: SWAP_ROUTER,
        data: '0x12345678',
        value: '0',
        tokens: [{ token: baseUsdc.address, index: 4 }],
      },
    ]);
  });

  it('sends exactly tx.value for native input with exactValue', async () => {
    const value = '10000000000000000';
    const result = await zapSwap({ inputPosition: -1, value, exactValue: true }, true, nativeQuote);

    expect(result.zaps).toEqual([{ target: SWAP_ROUTER, data: '0x12345678', value, tokens: [] }]);
  });

  it('sends the whole native balance for native input without exactValue', async () => {
    const value = '10000000000000000';
    const result = await zapSwap({ inputPosition: -1, value }, true, nativeQuote);

    expect(result.zaps).toEqual([
      {
        target: SWAP_ROUTER,
        data: '0x12345678',
        value,
        tokens: [{ token: ZERO_ADDRESS, index: -1 }],
      },
    ]);
  });

  it('ignores a separate spender for native input', async () => {
    const value = '10000000000000000';
    const result = await zapSwap(
      { inputPosition: -1, value, exactValue: true, approvalAddress: SPENDER },
      true,
      nativeQuote
    );

    expect(result.zaps).toEqual([{ target: SWAP_ROUTER, data: '0x12345678', value, tokens: [] }]);
  });
});
