import type BigNumber from 'bignumber.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenAmount, VaultToVaultSingleTokenDepositOption } from '../../transact-types.ts';
import type { ZapTransactHelpers } from '../IStrategy.ts';
import type * as FeeHelpers from '../../helpers/fee.ts';
import type * as QuoteHelpers from '../../helpers/quotes.ts';
import { baseWeth, bn, makeState } from '../../helpers/same-balance.test-helper.ts';
import { VaultToVaultSingleTokenStrategy } from './VaultToVaultSingleTokenStrategy.ts';

const { src, dest, fee } = vi.hoisted(() => ({
  src: { fetchQuote: vi.fn() },
  dest: { fetchQuote: vi.fn() },
  fee: { resolveZapFee: vi.fn() },
}));

vi.mock('../../handlers/vault/VaultSourceHandler.ts', () => ({
  VaultSourceHandler: vi.fn(function () {
    return src;
  }),
}));
vi.mock('../../handlers/vault/VaultDestHandler.ts', () => ({
  VaultDestHandler: vi.fn(function () {
    return dest;
  }),
}));
vi.mock('../../helpers/fee.ts', async importOriginal => ({
  ...(await importOriginal<typeof FeeHelpers>()),
  optionFeeEndpoints: () => ({}),
  resolveZapFee: fee.resolveZapFee,
}));
// price the 10 shares as 10 WETH so the impact math is easy to read
vi.mock('../../helpers/quotes.ts', async importOriginal => ({
  ...(await importOriginal<typeof QuoteHelpers>()),
  convertVaultShareToDepositTokenAmount: (_state: unknown, _id: string, amount: BigNumber) => ({
    token: baseWeth,
    amount,
  }),
}));

const state = makeState({ ui: { transact: { swapSlippage: 0.01 } } });
Object.assign(state.entities.tokens, { prices: { byOracleId: { WETH: bn('1') } } });

const helpers = {
  vault: { id: 'dest', chainId: 'base' },
  getState: () => state,
} as unknown as ZapTransactHelpers;
const option = {
  id: 'v2v',
  srcVaultId: 'src',
  destVaultId: 'dest',
  routingToken: baseWeth,
} as unknown as VaultToVaultSingleTokenDepositOption;
const strategy = new VaultToVaultSingleTokenStrategy(
  { strategyId: 'vault-to-vault-single-token' },
  helpers
);

beforeEach(() => {
  // the source withdraws to exactly 10 WETH; the dest deposits whatever it is quoted 1:1 (no real loss)
  src.fetchQuote.mockReset().mockResolvedValue({
    outputAmount: bn('10'),
    returned: [],
    sourceSteps: [],
    allowances: [],
    slippageAppliesToOutput: true,
  });
  dest.fetchQuote.mockReset().mockImplementation(async (amount: BigNumber) => ({
    outputs: [{ token: baseWeth, amount }],
    returned: [],
    destSteps: [],
  }));
  // 5 bps zap fee
  fee.resolveZapFee.mockReset().mockReturnValue({ step: { type: 'fee', netAmount: bn('9.995') } });
});

const quote = () =>
  strategy.fetchDepositQuote([{ token: baseWeth, amount: bn('10'), max: false }], option);

describe('VaultToVaultSingleTokenStrategy quote', () => {
  it('counts the slippage buffer as returned, so impact is only the real loss (the fee)', async () => {
    const q = await quote();

    // dest quoted on the 1% slippage floor of the post-fee amount
    expect(dest.fetchQuote).toHaveBeenCalledWith(bn('9.89505'), expect.anything());
    expect(q.returned).toEqual([{ token: baseWeth, amount: bn('0.09995') }]);
    expect(q.steps.at(-1)).toEqual({ type: 'unused', outputs: q.returned });
    // 10 in, 9.89505 deposited + 0.09995 back: only the 0.05% fee is lost (was ~1.05% before)
    expect(q.priceImpact).toBeCloseTo(0.0005, 10);
  });

  it('adds nothing when the source amount is not slipped', async () => {
    src.fetchQuote.mockResolvedValue({
      outputAmount: bn('10'),
      returned: [],
      sourceSteps: [],
      allowances: [],
      slippageAppliesToOutput: false,
    });

    const q = await quote();

    expect(dest.fetchQuote).toHaveBeenCalledWith(bn('9.995'), expect.anything());
    expect(q.returned).toEqual([]);
    expect(q.steps.some(step => step.type === 'unused')).toBe(false);
    expect(q.priceImpact).toBeCloseTo(0.0005, 10);
  });

  it('merges the buffer with routing-token dust the handlers already return', async () => {
    const srcDust: TokenAmount = { token: baseWeth, amount: bn('0.001') };
    src.fetchQuote.mockResolvedValue({
      outputAmount: bn('10'),
      returned: [srcDust],
      sourceSteps: [],
      allowances: [],
      slippageAppliesToOutput: true,
    });

    const q = await quote();

    expect(q.returned).toEqual([{ token: baseWeth, amount: bn('0.10095') }]);
  });
});
