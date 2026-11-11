import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import { QuoteCowcentratedNotActionableError } from '../../strategies/error.ts';
import type { ZapTransactHelpers } from '../../strategies/IStrategy.ts';
import type { DestHandlerContext } from '../types.ts';
import { VaultDestHandler } from './VaultDestHandler.ts';

const { strategies } = vi.hoisted(() => ({ strategies: [] as unknown[] }));

vi.mock('../../../instances.ts', () => ({
  getTransactApi: async () => ({ getInnerZapStrategiesForVault: async () => strategies }),
}));

const inputToken = { address: '0xusdc', symbol: 'USDC', decimals: 6 };

/** composable strategy whose deposit quote fails with one error per option */
function failingStrategy(errors: Error[]) {
  return {
    id: 'vault-composer',
    fetchDepositUserlessZapBreakdown: vi.fn(),
    fetchWithdrawUserlessZapBreakdown: vi.fn(),
    fetchDepositOptions: async () => errors.map((_, i) => ({ id: `o${i}`, inputs: [inputToken] })),
    fetchDepositQuote: async (_inputs: unknown, option: { id: string }) => {
      throw errors[Number(option.id.slice(1))];
    },
  };
}

const ctx = {
  destChainId: 'base',
  inputToken,
  resolveHelpersForVault: async () => ({}) as ZapTransactHelpers,
} as unknown as DestHandlerContext;

describe('VaultDestHandler.fetchQuote', () => {
  it('surfaces a typed error from any route over plain route failures', async () => {
    const locked = new QuoteCowcentratedNotActionableError('deposit', 123);
    strategies.splice(0, Infinity, failingStrategy([new Error('No quotes found'), locked]));

    await expect(new VaultDestHandler('dest').fetchQuote(new BigNumber(1), ctx)).rejects.toBe(
      locked
    );
  });

  it('falls back to the generic error when no route has a typed error', async () => {
    strategies.splice(0, Infinity, failingStrategy([new Error('No quotes found')]));

    await expect(new VaultDestHandler('dest').fetchQuote(new BigNumber(1), ctx)).rejects.toThrow(
      '[vault-dest] No deposit route from input token could be quoted for vault dest'
    );
  });
});
