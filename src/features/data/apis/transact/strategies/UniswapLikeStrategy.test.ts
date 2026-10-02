import type BigNumber from 'bignumber.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenErc20 } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import {
  arcEurc,
  arcNative,
  arcUsdc,
  baseNative,
  baseUsdc,
  baseWeth,
  bn,
  depositRowTokens,
  erc20Token,
  expectRowTokens,
  makeState,
  withdrawRowTokens,
} from '../helpers/same-balance.test-helper.ts';
import type { QuoteRequest } from '../swap/ISwapProvider.ts';
import { SwapAggregator } from '../swap/SwapAggregator.ts';
import type { UniswapV2DepositOption } from '../transact-types.ts';
import type { ZapTransactHelpers } from './IStrategy.ts';
import { WNativeSwapProvider } from '../swap/wnative/WNativeSwapProvider.ts';
import { UniswapV2StrategyImpl } from './uniswap-v2/UniswapV2Strategy.ts';

const wnativeProvider = new WNativeSwapProvider();
const swapAggregator = new SwapAggregator([new WNativeSwapProvider()]);

const { pool } = vi.hoisted(() => ({
  pool: {
    getOptimalSwapAmount: vi.fn(),
    swap: vi.fn(),
    addLiquidity: vi.fn(),
  },
}));

vi.mock('../../amm/amm.ts', () => ({
  getUniswapLikePool: vi.fn(async () => pool),
}));

const arcLp = erc20Token(
  'arc',
  'USDC-EURC',
  'USDC-EURC',
  '0x00000000000000000000000000000000000000c1',
  18
);
const baseLp = erc20Token(
  'base',
  'WETH-USDC',
  'WETH-USDC',
  '0x00000000000000000000000000000000000000c2',
  18
);

function withLp(state: BeefyState, lp: TokenErc20) {
  const chainTokens = state.entities.tokens.byChainId[lp.chainId]!;
  chainTokens.byId[lp.id] = lp.address.toLowerCase();
  chainTokens.byAddress[lp.address.toLowerCase()] = lp;
}

const state = makeState();
withLp(state, arcLp);
withLp(state, baseLp);
Object.assign(state.entities.tokens, { prices: { byOracleId: {} } });
Object.assign(state.entities, {
  zaps: {
    ...state.entities.zaps,
    amms: { byId: { 'test-amm': { id: 'test-amm', type: 'uniswap-v2' } } },
  },
});

function makeStrategy(chainId: 'arc' | 'base', assetIds: [string, string], lp: TokenErc20) {
  const fetchQuotes = vi.fn();
  const helpers = {
    vault: {
      id: `${chainId}-lp`,
      type: 'standard',
      chainId,
      assetIds,
      depositTokenAddress: lp.address,
    },
    vaultType: { id: 'standard', depositToken: lp },
    zap: { manager: '0x000000000000000000000000000000000000beef', router: '0x01' },
    swapAggregator: {
      fetchQuotes,
      fetchTokenSupport: swapAggregator.fetchTokenSupport.bind(swapAggregator),
    },
    getState: () => state,
  } as unknown as ZapTransactHelpers;
  const strategy = new UniswapV2StrategyImpl(
    { strategyId: 'uniswap-v2', ammId: 'test-amm' },
    helpers
  );
  const option = {
    id: 'option',
    depositToken: lp,
    swapVia: 'pool',
  } as unknown as UniswapV2DepositOption;
  return { strategy, option, fetchQuotes };
}

beforeEach(() => {
  pool.getOptimalSwapAmount
    .mockReset()
    .mockImplementation((amountIn: BigNumber) => amountIn.idiv(2));
  pool.swap
    .mockReset()
    .mockImplementation((amountIn: BigNumber) => ({ amountOut: amountIn.idiv(2) }));
  pool.addLiquidity.mockReset().mockReturnValue({ liquidity: bn('1000000000000000000') });
});

describe('UniswapLikeStrategy pool deposit quote', () => {
  it('floors a native input to the erc20 view decimals where balanceSharedWithWrapped and dp differ', async () => {
    const { strategy, option, fetchQuotes } = makeStrategy('arc', ['USDC', 'EURC'], arcLp);
    const input = { token: arcNative, amount: bn('10.0000005'), max: false };
    fetchQuotes.mockImplementation(async (request: QuoteRequest, state: BeefyState) => [
      await wnativeProvider.fetchQuote(request, state),
    ]);

    const quote = await strategy.fetchDepositQuote([input], option);

    // 10.0000005 floored to 6dp, in 6dp wei; before the fix this was 10000000500000000000
    expect(pool.getOptimalSwapAmount).toHaveBeenCalledWith(bn('10000000'), arcUsdc.address);
    // lpTokens sort USDC (0x3600...) before EURC (0xe0c0...), so USDC is amountA
    expect(pool.addLiquidity).toHaveBeenCalledWith(bn('5000000'), arcUsdc.address, bn('2500000'));
    expect(quote.inputs).toEqual([input]);
    // the native -> wnative step is call-less on a shared balance, but still moves the amount
    expect(fetchQuotes).toHaveBeenCalledTimes(1);
    expect(quote.steps.map(step => step.type)).toEqual(['swap', 'swap', 'build', 'deposit']);
    expect(quote.steps[0]).toMatchObject({ via: 'aggregator', providerId: 'wnative' });
    expect(quote.steps[0]).toHaveProperty('toAmount', bn('10'));
    expect(quote.steps[1]).toMatchObject({ via: 'pool', fromToken: arcUsdc, toToken: arcEurc });
    expect(quote.steps[1]).toHaveProperty('fromAmount', bn('5'));
    // the half left over is what the router holds in the erc20 view: no sub-6dp tail
    expect(quote.steps[2]).toMatchObject({
      type: 'build',
      inputs: [
        { token: arcUsdc, amount: bn('5') },
        { token: arcEurc, amount: bn('2.5') },
      ],
    });
  });

  it('leaves the erc20 view input unchanged where balanceSharedWithWrapped', async () => {
    const { strategy, option } = makeStrategy('arc', ['USDC', 'EURC'], arcLp);

    await strategy.fetchDepositQuote([{ token: arcUsdc, amount: bn('10'), max: false }], option);

    expect(pool.getOptimalSwapAmount).toHaveBeenCalledWith(bn('10000000'), arcUsdc.address);
  });

  it('still wraps a native input at its own decimals without balanceSharedWithWrapped', async () => {
    const { strategy, option, fetchQuotes } = makeStrategy('base', ['WETH', 'USDC'], baseLp);
    const amount = bn('1.5');
    fetchQuotes.mockResolvedValue([
      {
        providerId: 'wnative',
        fromToken: baseNative,
        fromAmount: amount,
        toToken: baseWeth,
        toAmount: amount,
        fee: { value: 0 },
      },
    ]);

    const quote = await strategy.fetchDepositQuote(
      [{ token: baseNative, amount, max: false }],
      option
    );

    expect(pool.getOptimalSwapAmount).toHaveBeenCalledWith(
      bn('1500000000000000000'),
      baseWeth.address
    );
    expect(fetchQuotes).toHaveBeenCalledTimes(1);
    expect(quote.steps.map(step => step.type)).toEqual(['swap', 'swap', 'build', 'deposit']);
    expect(quote.steps[0]).toMatchObject({ via: 'aggregator', providerId: 'wnative' });
  });
});

describe('UniswapLikeStrategy option lists where balanceSharedWithWrapped', () => {
  it('does not add the native view beside the pool erc20 for deposit', async () => {
    const { strategy } = makeStrategy('arc', ['USDC', 'EURC'], arcLp);

    const rows = depositRowTokens(await strategy.fetchDepositOptions());

    expectRowTokens(rows, [arcUsdc, arcEurc]);
  });

  it('does not add the native view beside the pool erc20 for withdraw', async () => {
    const { strategy } = makeStrategy('arc', ['USDC', 'EURC'], arcLp);

    const rows = withdrawRowTokens(await strategy.fetchWithdrawOptions());

    expectRowTokens(rows, [arcUsdc, arcEurc]);
  });
});

describe('UniswapLikeStrategy option lists where native and wnative are separate balances', () => {
  it('still adds native beside the pool wnative, they are not the same funds', async () => {
    const { strategy } = makeStrategy('base', ['WETH', 'USDC'], baseLp);

    const rows = depositRowTokens(await strategy.fetchDepositOptions());

    expectRowTokens(rows, [baseNative, baseWeth, baseUsdc]);
  });
});
