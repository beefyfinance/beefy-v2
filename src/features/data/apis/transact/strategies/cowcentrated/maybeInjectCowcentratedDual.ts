import type { AnyComposableStrategy, ZapTransactHelpers } from '../IStrategy.ts';
import { CowcentratedDualStrategy } from './CowcentratedDualStrategy.ts';

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

  const dual = new CowcentratedDualStrategy(
    { strategyId: 'cowcentrated-dual' },
    cow.getHelpers() as ZapTransactHelpers
  );
  return [...underlyings, dual];
}
