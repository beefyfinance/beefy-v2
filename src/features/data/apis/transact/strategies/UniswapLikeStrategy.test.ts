import type BigNumber from 'bignumber.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenErc20 } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import {
  arcEurc,
  arcNative,
  arcUsdc,
  baseNative,
  baseWeth,
  bn,
  erc20Token,
  makeState,
} from '../helpers/same-balance-fixture.ts';
import type { QuoteRequest } from '../swap/ISwapProvider.ts';
import type { UniswapV2DepositOption } from '../transact-types.ts';
import type { ZapTransactHelpers } from './IStrategy.ts';
import { WNativeSwapProvider } from '../swap/wnative/WNativeSwapProvider.ts';
import { UniswapV2StrategyImpl } from './uniswap-v2/UniswapV2Strategy.ts';

const wnativeProvider = new WNativeSwapProvider();

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
  zaps: { amms: { byId: { 'test-amm': { id: 'test-amm', type: 'uniswap-v2' } } } },
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
    vaultType: { id: 'standard' },
    zap: { manager: '0x000000000000000000000000000000000000beef', router: '0x01' },
    swapAggregator: { fetchQuotes },
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
  it('arc native input reaches the pool in the 6 decimals of the erc20 view (D2)', async () => {
    const { strategy, option, fetchQuotes } = makeStrategy('arc', ['USDC', 'EURC'], arcLp);
    const input = { token: arcNative, amount: bn('10.0000005'), max: false };
    fetchQuotes.mockImplementation(async (request: QuoteRequest, state: BeefyState) => [
      await wnativeProvider.fetchQuote(request, state),
    ]);

    const quote = await strategy.fetchDepositQuote([input], option);

    // 10.0000005 floored to 6dp, in 6dp wei; before the fix this was 10000000500000000000
    expect(pool.getOptimalSwapAmount).toHaveBeenCalledWith(bn('10000000'), arcUsdc.address);
    // lpTokens sort EURC (0x...0e0c) before USDC (0x3600...), so USDC is amountB
    expect(pool.addLiquidity).toHaveBeenCalledWith(bn('2500000'), arcEurc.address, bn('5000000'));
    expect(quote.inputs).toEqual([input]);
    // the native -> wnative step is call-less on arc, but still moves the amount for the breakdown
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
        { token: arcEurc, amount: bn('2.5') },
        { token: arcUsdc, amount: bn('5') },
      ],
    });
  });

  it('arc erc20 input is unchanged', async () => {
    const { strategy, option } = makeStrategy('arc', ['USDC', 'EURC'], arcLp);

    await strategy.fetchDepositQuote([{ token: arcUsdc, amount: bn('10'), max: false }], option);

    expect(pool.getOptimalSwapAmount).toHaveBeenCalledWith(bn('10000000'), arcUsdc.address);
  });

  it('native input elsewhere still wraps and uses 18 decimals', async () => {
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
