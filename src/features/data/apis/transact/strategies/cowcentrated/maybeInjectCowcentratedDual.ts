import type { AnyComposableStrategy, ZapTransactHelpers } from '../IStrategy.ts';
import { CowcentratedDualStrategy } from './CowcentratedDualStrategy.ts';

/** Single source of truth for instantiating the cowcentrated-dual strategy. */
export function buildCowcentratedDualStrategy(helpers: ZapTransactHelpers) {
  return new CowcentratedDualStrategy({ strategyId: 'cowcentrated-dual' }, helpers);
}

/**
 * If the underlyings list contains `cowcentrated` but not `cowcentrated-dual`,
 * auto-create a `cowcentrated-dual` instance using the same helpers and append it.
 *
 * Lets composers (gov-composer, vault-composer) expose the dual-input CLM deposit
 * option without requiring each underlying CLM vault's JSON config to list
 * `cowcentrated-dual` explicitly.
 */
export function maybeInjectCowcentratedDual(
  underlyings: AnyComposableStrategy[]
): AnyComposableStrategy[] {
  const cow = underlyings.find(u => u.id === 'cowcentrated');
  const hasDual = underlyings.some(u => u.id === 'cowcentrated-dual');
  if (!cow || hasDual) {
    return underlyings;
  }

  return [...underlyings, buildCowcentratedDualStrategy(cow.getHelpers() as ZapTransactHelpers)];
}
