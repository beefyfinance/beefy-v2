import BigNumber from 'bignumber.js';
import { decodeFunctionData, toFunctionSelector } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20, TokenNative } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import { SwapAggregator } from '../swap/SwapAggregator.ts';
import { Balances } from './Balances.ts';
import { WNativeSwapProvider } from '../swap/wnative/WNativeSwapProvider.ts';
import { fetchZapAggregatorSwap } from '../zap/swap.ts';
import { buildFeeZapSteps } from './fee.ts';
import { allTokensAreDistinct, floorToSharedPrecision, isSameBalancePair } from './tokens.ts';

// arc: native USDC (18 decimals) and the 0x3600 ERC-20 (6 decimals) are one balance

function nativeToken(chainId: ChainEntity['id'], symbol: string, id: string = symbol): TokenNative {
  return {
    type: 'native',
    id,
    chainId,
    address: 'native',
    oracleId: symbol,
    decimals: 18,
    symbol,
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  };
}

function erc20Token(
  chainId: ChainEntity['id'],
  id: string,
  symbol: string,
  address: string,
  decimals: number
): TokenErc20 {
  return {
    type: 'erc20',
    id,
    chainId,
    address,
    oracleId: symbol,
    decimals,
    symbol,
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  };
}

const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const RECIPIENT = '0xA55e75C4815Ff39eFD76C257857441d9FD99b45b';
const ROUTER = '0xaEFB7C930b9181A31a0CDF0409375b78C059395C';

const arcNative = nativeToken('arc', 'USDC', 'NATIVE');
const arcUsdc = erc20Token('arc', 'USDC', 'USDC', ARC_USDC_ADDRESS, 6);
const arcEurc = erc20Token('arc', 'EURC', 'EURC', '0x0000000000000000000000000000000000000e0c', 6);
const baseNative = nativeToken('base', 'ETH');
const baseWeth = erc20Token(
  'base',
  'WETH',
  'WETH',
  '0x4200000000000000000000000000000000000006',
  18
);

function chainTokens(native: TokenNative, wnative: TokenErc20) {
  return {
    native: native.id,
    wnative: wnative.id,
    byId: { [native.id]: 'native', [wnative.id]: wnative.address.toLowerCase() },
    byAddress: { native, [wnative.address.toLowerCase()]: wnative },
  };
}

const state = {
  entities: {
    tokens: {
      byChainId: {
        arc: chainTokens(arcNative, arcUsdc),
        base: chainTokens(baseNative, baseWeth),
      },
    },
  },
} as unknown as BeefyState;

const bn = (value: string) => new BigNumber(value);
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
  it('floors arc native to the 6 decimals of the ERC-20 view', () => {
    expect(
      floorToSharedPrecision(bn('12.34567890123456789'), arcNative, arcUsdc).toString(10)
    ).toBe('12.345678');
  });

  it('leaves amounts unchanged where it does not apply', () => {
    expect(floorToSharedPrecision(bn('1.5'), arcUsdc, arcUsdc).toString(10)).toBe('1.5');
    expect(floorToSharedPrecision(bn('1.1234567'), arcEurc, arcUsdc).toString(10)).toBe(
      '1.1234567'
    );
    expect(
      floorToSharedPrecision(bn('1.000000000000000001'), baseNative, baseWeth).toString(10)
    ).toBe('1.000000000000000001');
  });
});

describe('isSameBalancePair', () => {
  it('matches native <-> wnative on arc only', () => {
    expect(isSameBalancePair(arcNative, arcUsdc, arcUsdc)).toBe(true);
    expect(isSameBalancePair(arcUsdc, arcNative, arcUsdc)).toBe(true);
    expect(isSameBalancePair(arcNative, arcEurc, arcUsdc)).toBe(false);
    expect(isSameBalancePair(baseNative, baseWeth, baseWeth)).toBe(false);
    expect(isSameBalancePair(baseNative, arcUsdc, arcUsdc)).toBe(false);
  });
});

describe('WNativeSwapProvider', () => {
  const provider = new WNativeSwapProvider();

  it('offers no wrap route on arc: there is nothing to wrap', async () => {
    expect(await provider.getSupportedTokens(undefined, 'arc', state)).toEqual([]);
    expect(await provider.getSupportedTokens(undefined, 'base', state)).toEqual([
      baseNative,
      baseWeth,
    ]);
  });

  it('never builds a wrap call on arc', async () => {
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

  it('still wraps 1:1 on other chains', async () => {
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
  it('refuses to build a step for the arc shared pair: strategies must use the erc20 view', async () => {
    const fromAmount = bn('10.0000005');
    const quote = {
      providerId: 'wnative',
      fromToken: arcNative,
      fromAmount,
      toToken: arcUsdc,
      toAmount: bn('10'),
      fee: { value: 0 },
    };
    const fetchSwap = vi.fn();
    const aggregator = { fetchSwap } as unknown as ISwapAggregator;

    await expect(
      fetchZapAggregatorSwap(
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
      )
    ).rejects.toThrow('share one balance');
    expect(fetchSwap).not.toHaveBeenCalled();
  });

  it('still emits the wrap call on other chains', async () => {
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
  it('charges arc native fees in the 6 decimals of the ERC-20 view', () => {
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

  it('skips arc native fees below the ERC-20 precision', () => {
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

  it('keeps wrap + transfer with 18 decimals on other chains', () => {
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

describe('Balances', () => {
  it('keeps arc native and wnative in one bucket, at the erc20 precision', () => {
    const balances = new Balances([{ token: arcNative, amount: bn('10.0000005') }], arcUsdc);
    expect(balances.get(arcUsdc).toString(10)).toBe('10');
    expect(balances.get(arcNative).toString(10)).toBe('10');

    expect(
      balances
        .subtract({ token: arcUsdc, amount: bn('10') })
        .get(arcUsdc)
        .toString(10)
    ).toBe('0');
  });

  it('floors on the way in and out, so a native round trip nets to zero', () => {
    const balances = new Balances([{ token: arcNative, amount: bn('10.0000005') }], arcUsdc);
    balances.subtract({ token: arcNative, amount: bn('10.0000005') });
    expect(balances.get(arcUsdc).toString(10)).toBe('0');
  });

  it('still catches a real underflow', () => {
    const balances = new Balances([{ token: arcNative, amount: bn('10') }], arcUsdc);
    expect(() => balances.subtract({ token: arcUsdc, amount: bn('10.000001') })).toThrow(
      'is negative'
    );
  });

  it('keeps native and wnative separate everywhere else', () => {
    const balances = new Balances([{ token: baseNative, amount: bn('1.5') }], baseWeth);
    expect(balances.get(baseNative).toString(10)).toBe('1.5');
    expect(balances.get(baseWeth).toString(10)).toBe('0');
  });

  it('forChain only shares the bucket on same-balance chains', () => {
    expect(
      Balances.forChain(state, 'arc', [{ token: arcNative, amount: bn('10.0000005') }])
        .get(arcUsdc)
        .toString(10)
    ).toBe('10');
    expect(
      Balances.forChain(state, 'base', [{ token: baseNative, amount: bn('1.5') }])
        .get(baseWeth)
        .toString(10)
    ).toBe('0');
  });
});

describe('allTokensAreDistinct', () => {
  it('counts the arc pair as one token when given wnative', () => {
    expect(allTokensAreDistinct([arcNative, arcUsdc, arcEurc], arcUsdc)).toBe(false);
    expect(allTokensAreDistinct([arcNative, arcEurc], arcUsdc)).toBe(true);
  });

  it('is unchanged for other chains and without wnative', () => {
    expect(allTokensAreDistinct([baseNative, baseWeth], baseWeth)).toBe(true);
    expect(allTokensAreDistinct([arcNative, arcUsdc])).toBe(true);
  });
});

describe('SwapAggregator on a same-balance chain', () => {
  // no provider serves the arc pair: the wnative provider lists nothing and the api has no arc
  const aggregator = new SwapAggregator([]);

  it('still offers both views of the wanted token', async () => {
    const support = await aggregator.fetchTokenSupport([arcUsdc], undefined, 'arc', state);
    expect(support.any).toEqual([arcNative, arcUsdc]);
  });

  it('offers nothing extra on other chains', async () => {
    const support = await aggregator.fetchTokenSupport([baseWeth], undefined, 'base', state);
    expect(support.any).toEqual([]);
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
