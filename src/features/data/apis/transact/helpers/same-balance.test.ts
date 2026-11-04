import BigNumber from 'bignumber.js';
import { decodeFunctionData, toFunctionSelector } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import { SwapAggregator } from '../swap/SwapAggregator.ts';
import { WNativeSwapProvider } from '../swap/wnative/WNativeSwapProvider.ts';
import { fetchZapAggregatorSwap } from '../zap/swap.ts';
import { buildFeeZapSteps } from './fee.ts';
import {
  floorToSharedPrecision,
  isSameBalancePair,
  isSameOrSharedBalance,
  withoutSharedNativeView,
} from './tokens.ts';
import { selectSharedBalanceWrappedToken } from '../../../selectors/tokens.ts';
import {
  ARC_USDC_ADDRESS,
  arcEurc,
  arcNative,
  arcUsdc,
  baseNative,
  baseWeth,
  bn,
  makeState,
} from './same-balance.test-helper.ts';

const RECIPIENT = '0xA55e75C4815Ff39eFD76C257857441d9FD99b45b';
const ROUTER = '0xaEFB7C930b9181A31a0CDF0409375b78C059395C';
const state = makeState();

const arcShared = selectSharedBalanceWrappedToken(state, 'arc')!;
const baseShared = selectSharedBalanceWrappedToken(state, 'base');

const wei = (amount: BigNumber, decimals: number) =>
  BigInt(amount.shiftedBy(decimals).integerValue(BigNumber.ROUND_FLOOR).toString(10));

function decodeTransferAmount(data: string): bigint {
  const decoded = decodeFunctionData({ abi: ERC20Abi, data: data as `0x${string}` });
  if (decoded.functionName !== 'transfer') {
    throw new Error(`Expected transfer, got ${decoded.functionName}`);
  }
  return decoded.args[1];
}

describe('floorToSharedPrecision', () => {
  it('floors native to the erc20 view decimals where balanceSharedWithWrapped and dp differ', () => {
    expect(
      floorToSharedPrecision(bn('12.34567890123456789'), arcNative, arcShared).toString(10)
    ).toBe('12.345678');
  });

  it('leaves amounts unchanged where it does not apply', () => {
    expect(floorToSharedPrecision(bn('1.5'), arcUsdc, arcShared).toString(10)).toBe('1.5');
    expect(floorToSharedPrecision(bn('1.1234567'), arcEurc, arcShared).toString(10)).toBe(
      '1.1234567'
    );
    expect(
      floorToSharedPrecision(bn('1.000000000000000001'), baseNative, baseShared).toString(10)
    ).toBe('1.000000000000000001');
  });
});

describe('isSameBalancePair', () => {
  it('matches native <-> wnative only where balanceSharedWithWrapped', () => {
    expect(isSameBalancePair(arcNative, arcUsdc, arcShared)).toBe(true);
    expect(isSameBalancePair(arcUsdc, arcNative, arcShared)).toBe(true);
    expect(isSameBalancePair(arcNative, arcEurc, arcShared)).toBe(false);
    expect(isSameBalancePair(baseNative, baseWeth, baseShared)).toBe(false);
    expect(isSameBalancePair(baseNative, arcUsdc, arcShared)).toBe(false);
  });
});

describe('isSameOrSharedBalance', () => {
  it('treats either view of the one balance as the same token where balanceSharedWithWrapped', () => {
    expect(isSameOrSharedBalance(arcNative, arcUsdc, arcShared)).toBe(true);
    expect(isSameOrSharedBalance(arcUsdc, arcUsdc, arcShared)).toBe(true);
    expect(isSameOrSharedBalance(arcNative, arcEurc, arcShared)).toBe(false);
  });

  it('is plain token equality without balanceSharedWithWrapped', () => {
    expect(isSameOrSharedBalance(baseNative, baseWeth, baseShared)).toBe(false);
    expect(isSameOrSharedBalance(baseWeth, baseWeth, baseShared)).toBe(true);
  });
});

describe('withoutSharedNativeView', () => {
  it('keeps one entry when both views are listed', () => {
    expect(withoutSharedNativeView([arcNative, arcEurc, arcUsdc], arcShared)).toEqual([
      arcUsdc,
      arcEurc,
    ]);
  });

  it('swaps in the erc20 view when native is the only view listed', () => {
    expect(withoutSharedNativeView([arcNative, arcEurc], arcShared)).toEqual([arcUsdc, arcEurc]);
  });

  it('keeps both without balanceSharedWithWrapped', () => {
    expect(withoutSharedNativeView([baseNative, baseWeth], baseShared)).toEqual([
      baseNative,
      baseWeth,
    ]);
  });
});

describe('selectSharedBalanceWrappedToken', () => {
  it('is the wnative only where balanceSharedWithWrapped', () => {
    expect(arcShared).toBe(arcUsdc);
    expect(baseShared).toBeUndefined();
  });
});

describe('WNativeSwapProvider', () => {
  const provider = new WNativeSwapProvider();

  it('supports native and wnative where balanceSharedWithWrapped', async () => {
    expect(await provider.getSupportedTokens(undefined, 'arc', state)).toEqual([
      arcNative,
      arcUsdc,
    ]);
  });

  it('quotes native <-> wnative 1:1 at the shared precision where dp differ', async () => {
    const toWnative = await provider.fetchQuote(
      { fromToken: arcNative, fromAmount: bn('12.34567890123456789'), toToken: arcUsdc },
      state
    );
    expect(toWnative.toAmount.toString(10)).toBe('12.345678');

    const toNative = await provider.fetchQuote(
      { fromToken: arcUsdc, fromAmount: bn('3.5'), toToken: arcNative },
      state
    );
    expect(toNative.toAmount.toString(10)).toBe('3.5');
  });

  it('never builds a wrap call where balanceSharedWithWrapped', async () => {
    const quote = {
      providerId: 'wnative',
      fromToken: arcNative,
      fromAmount: bn('1'),
      toToken: arcUsdc,
      toAmount: bn('1'),
      fee: { value: 0 },
    };
    await expect(
      provider.fetchSwap({ quote, fromAddress: ROUTER, slippage: 0.01 }, state)
    ).rejects.toThrow('No wrap/unwrap call on arc');
  });

  it('still wraps 1:1 without balanceSharedWithWrapped', async () => {
    const amount = bn('1.000000000000000001');
    const quote = await provider.fetchQuote(
      { fromToken: baseNative, fromAmount: amount, toToken: baseWeth },
      state
    );
    expect(quote.toAmount.toString(10)).toBe('1.000000000000000001');

    const swap = await provider.fetchSwap({ quote, fromAddress: ROUTER, slippage: 0.01 }, state);
    expect(swap.tx.toAddress).toBe(baseWeth.address);
    expect(swap.tx.value).toBe('1000000000000000001');
    expect(swap.tx.data).toBe(toFunctionSelector('deposit()'));
  });
});

describe('fetchZapAggregatorSwap', () => {
  it('moves native to wnative without a router call where balanceSharedWithWrapped', async () => {
    const provider = new WNativeSwapProvider();
    const fromAmount = bn('10.0000005');
    const quote = await provider.fetchQuote(
      { fromToken: arcNative, fromAmount, toToken: arcUsdc },
      state
    );
    const fetchSwap = vi.fn();
    const aggregator = { fetchSwap } as unknown as ISwapAggregator;

    const result = await fetchZapAggregatorSwap(
      {
        quote,
        providerId: quote.providerId,
        inputs: [{ token: arcNative, amount: fromAmount }],
        outputs: [{ token: arcUsdc, amount: quote.toAmount }],
        maxSlippage: 0.01,
        zapRouter: ROUTER,
        insertBalance: true,
      },
      aggregator,
      state
    );

    expect(fetchSwap).not.toHaveBeenCalled();
    expect(result.zaps).toEqual([]);
    expect(result.inputs).toEqual([{ token: arcNative, amount: fromAmount }]);
    expect(result.minOutputs).toHaveLength(1);
    expect(result.minOutputs[0].token).toBe(arcUsdc);
    expect(result.minOutputs[0].amount.toString(10)).toBe('10');
  });

  it('still emits the wrap call without balanceSharedWithWrapped', async () => {
    const provider = new WNativeSwapProvider();
    const amount = bn('2');
    const quote = await provider.fetchQuote(
      { fromToken: baseNative, fromAmount: amount, toToken: baseWeth },
      state
    );
    const aggregator = {
      fetchSwap: (_providerId: string, request: Parameters<typeof provider.fetchSwap>[0]) =>
        provider.fetchSwap(request, state),
    } as unknown as ISwapAggregator;

    const result = await fetchZapAggregatorSwap(
      {
        quote,
        providerId: quote.providerId,
        inputs: [{ token: baseNative, amount }],
        outputs: [{ token: baseWeth, amount }],
        maxSlippage: 0.01,
        zapRouter: ROUTER,
        insertBalance: false,
      },
      aggregator,
      state
    );

    expect(result.zaps).toHaveLength(1);
    expect(result.zaps[0].target).toBe(baseWeth.address);
    expect(result.zaps[0].value).toBe('2000000000000000000');
  });
});

describe('buildFeeZapSteps', () => {
  it('charges native fees at the erc20 view decimals where balanceSharedWithWrapped and dp differ', () => {
    const gross = bn('100.123456789012345678');
    const { zaps, feeAmount, netAmount } = buildFeeZapSteps({
      state,
      token: arcNative,
      grossAmount: gross,
      recipient: RECIPIENT,
      bps: 5,
    });

    expect(feeAmount.toString(10)).toBe('0.050061');
    expect(netAmount.toString(10)).toBe('100.073395789012345678');
    expect(zaps).toHaveLength(1);
    expect(zaps[0].target).toBe(ARC_USDC_ADDRESS);
    expect(zaps[0].value).toBe('0');
    const transferred = decodeTransferAmount(zaps[0].data);
    expect(transferred).toBe(50061n);
    // what is left in the router is exactly the quoted net amount
    expect(wei(gross, 18) - transferred * 10n ** 12n).toBe(wei(netAmount, 18));
  });

  it('skips native fees below the erc20 precision where dp differ', () => {
    const { zaps, feeAmount } = buildFeeZapSteps({
      state,
      token: arcNative,
      grossAmount: bn('0.001'),
      recipient: RECIPIENT,
      bps: 5,
    });
    expect(feeAmount.isZero()).toBe(true);
    expect(zaps).toEqual([]);
  });

  it('keeps wrap + transfer at native decimals without balanceSharedWithWrapped', () => {
    const { zaps, feeAmount } = buildFeeZapSteps({
      state,
      token: baseNative,
      grossAmount: bn('100.123456789012345678'),
      recipient: RECIPIENT,
      bps: 5,
    });
    expect(feeAmount.toString(10)).toBe('0.050061728394506172');
    expect(zaps).toHaveLength(2);
    expect(zaps[0].value).toBe('50061728394506172');
    expect(decodeTransferAmount(zaps[1].data)).toBe(50061728394506172n);
  });
});

describe('SwapAggregator where balanceSharedWithWrapped', () => {
  const aggregator = new SwapAggregator([new WNativeSwapProvider()]);

  it('offers the wanted token once, as the erc20 view', async () => {
    const support = await aggregator.fetchTokenSupport([arcUsdc], undefined, 'arc', state);
    expect(support.any).toEqual([arcUsdc]);
    expect(support.tokens).toEqual([[arcUsdc]]);
  });

  it('quotes native -> wnative as an exact identity, floored to the erc20 decimals', async () => {
    const [quote] = await aggregator.fetchQuotes(
      { fromToken: arcNative, toToken: arcUsdc, fromAmount: bn('10.0000005') },
      state
    );
    expect(quote.providerId).toBe('wnative');
    expect(quote.toAmount.toString(10)).toBe('10');
  });

  it('reports the shared pair as swappable, and unrelated pairs as not', async () => {
    expect(await aggregator.canSwapTokenPair(arcNative, arcUsdc, undefined, 'arc', state)).toBe(
      true
    );
    expect(await aggregator.canSwapTokenPair(arcNative, arcEurc, undefined, 'arc', state)).toBe(
      false
    );
  });
});
