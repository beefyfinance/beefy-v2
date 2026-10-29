import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import { QuoteCowcentratedNotActionableError } from '../../strategies/error.ts';
import type { ZapTransactHelpers } from '../../strategies/IStrategy.ts';
import type { SourceHandlerContext } from '../types.ts';
import { VaultSourceHandler } from './VaultSourceHandler.ts';

const { strategies } = vi.hoisted(() => ({ strategies: [] as unknown[] }));

vi.mock('../../../instances.ts', () => ({
  getTransactApi: async () => ({ getInnerZapStrategiesForVault: async () => strategies }),
}));

const shareToken = { type: 'erc20', chainId: 'base', address: '0xshare', symbol: 'mooToken' };
const outputToken = { address: '0xusdc', symbol: 'USDC', decimals: 6 };

/** composable strategy whose withdraw quote fails with one error per option */
function failingStrategy(errors: Error[]) {
  return {
    id: 'vault-composer',
    fetchDepositUserlessZapBreakdown: vi.fn(),
    fetchWithdrawUserlessZapBreakdown: vi.fn(),
    fetchWithdrawOptions: async () =>
      errors.map((_, i) => ({ id: `o${i}`, inputs: [shareToken], wantedOutputs: [outputToken] })),
    fetchWithdrawQuote: async (_inputs: unknown, option: { id: string }) => {
      throw errors[Number(option.id.slice(1))];
    },
  };
}

const ctx = {
  sourceChainId: 'base',
  outputToken,
  resolveHelpersForVault: async () => ({ getState: () => ({}) }) as unknown as ZapTransactHelpers,
} as unknown as SourceHandlerContext;

const input = { token: shareToken, amount: new BigNumber(1), max: false };

describe('VaultSourceHandler.fetchQuote', () => {
  it('surfaces a typed error from any route over plain route failures', async () => {
    const locked = new QuoteCowcentratedNotActionableError('withdraw', 123);
    strategies.splice(0, Infinity, failingStrategy([new Error('No quotes found'), locked]));

    await expect(new VaultSourceHandler('src').fetchQuote(input as never, ctx)).rejects.toBe(
      locked
    );
  });

  it('falls back to the generic error when no route has a typed error', async () => {
    strategies.splice(0, Infinity, failingStrategy([new Error('No quotes found')]));

    await expect(new VaultSourceHandler('src').fetchQuote(input as never, ctx)).rejects.toThrow(
      '[vault-source] No withdraw route to output token could be quoted for vault src'
    );
  });
});
