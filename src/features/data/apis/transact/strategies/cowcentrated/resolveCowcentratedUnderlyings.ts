import type { AnyComposableStrategy, IComposableStrategy } from '../IStrategy.ts';
import { type ICowcentratedVaultType, isCowcentratedVaultType } from '../../vaults/IVaultType.ts';
import { maybeInjectCowcentratedDual } from './maybeInjectCowcentratedDual.ts';

/**
 * Resolve the cowcentrated underlying strategies for a composer: validates the input,
 * auto-injects `cowcentrated-dual` alongside `cowcentrated`, and extracts the shared
 * cowcentrated vault type.
 */
export function resolveCowcentratedUnderlyings(underlying: AnyComposableStrategy): {
  primary: IComposableStrategy<'cowcentrated'>;
  dual: IComposableStrategy<'cowcentrated-dual'> | undefined;
  vaultType: ICowcentratedVaultType;
} {
  if (underlying.id !== 'cowcentrated' && underlying.id !== 'cowcentrated-dual') {
    throw new Error('Underlying strategy must be cowcentrated or cowcentrated-dual');
  }
  const expanded = maybeInjectCowcentratedDual([underlying]) as AnyComposableStrategy<
    'cowcentrated' | 'cowcentrated-dual'
  >[];
  const primary = expanded.find(
    (s): s is IComposableStrategy<'cowcentrated'> => s.id === 'cowcentrated'
  );
  if (!primary) {
    throw new Error('No cowcentrated underlying strategy available');
  }
  const dual = expanded.find(
    (s): s is IComposableStrategy<'cowcentrated-dual'> => s.id === 'cowcentrated-dual'
  );
  const { vaultType } = primary.getHelpers();
  if (!isCowcentratedVaultType(vaultType)) {
    throw new Error('Underlying vault type is not cowcentrated');
  }
  return { primary, dual, vaultType };
}
