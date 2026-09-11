import { describe, expect, it, vi } from 'vitest';
import type { BeefyState } from '../../store/types.ts';
import type { ZapTransactHelpers } from './strategies/IStrategy.ts';
import type { ISwapAggregator } from './swap/ISwapAggregator.ts';
import type { ZapStrategyConfig } from './strategies/strategy-configs.ts';
import { TransactApi } from './transact.ts';
import type * as VaultSelectors from '../../selectors/vaults.ts';

vi.mock('../../selectors/vaults.ts', async importOriginal => ({
  ...(await importOriginal<typeof VaultSelectors>()),
  selectVaultUnderlyingVault: () => ({ id: 'underlying-vault', chainId: 'base' }),
}));

describe('TransactApi composer underlying strategies', () => {
  it('build underlying strategies with the composer helpers aggregator', async () => {
    const getState = () => ({}) as BeefyState;
    const scopedAggregator = { scoped: true } as unknown as ISwapAggregator;
    const defaultAggregator = { scoped: false } as unknown as ISwapAggregator;
    const underlyingZap = { router: '0xunderlying' };

    const composerHelpers = {
      vault: { id: 'composer-vault', chainId: 'base' },
      zap: { router: '0xcomposer' },
      swapAggregator: scopedAggregator,
      getState,
    } as unknown as ZapTransactHelpers;

    const received: ZapTransactHelpers[] = [];
    class FakeComposable {
      static readonly id = 'single';
      static readonly composable = true;
      constructor(_options: ZapStrategyConfig, helpers: ZapTransactHelpers) {
        received.push(helpers);
      }
    }

    const api = new TransactApi();
    vi.spyOn(api, 'getHelpersForVault').mockResolvedValue({
      vault: { id: 'underlying-vault', chainId: 'base' },
      zap: underlyingZap,
      swapAggregator: defaultAggregator,
      getState,
    } as unknown as ZapTransactHelpers);
    const internals = api as unknown as {
      getZapStrategyConstructorsForVault: () => Promise<unknown[]>;
      getComposableStrategyForZap: (helpers: ZapTransactHelpers) => Promise<unknown[]>;
    };
    vi.spyOn(internals, 'getZapStrategyConstructorsForVault').mockResolvedValue([
      { id: 'single', ctor: FakeComposable, options: { strategyId: 'single' } },
    ]);

    const strategies = await internals.getComposableStrategyForZap(composerHelpers);

    expect(strategies).toHaveLength(1);
    expect(received[0].swapAggregator).toBe(scopedAggregator);
    // everything else still comes from the underlying vault
    expect(received[0].zap).toBe(underlyingZap);
    expect(received[0].vault.id).toBe('underlying-vault');
  });
});
