import type { AnyComposableStrategy, IComposableStrategy } from '../IStrategy.ts';
import { type ICowcentratedVaultType, isCowcentratedVaultType } from '../../vaults/IVaultType.ts';

/**
 * Split a composer's underlyings into the `cowcentrated` primary and optional
 * `cowcentrated-dual` sibling, and expose the shared cowcentrated vault type.
 */
export function resolveCowcentratedUnderlyings(underlyings: AnyComposableStrategy[]): {
  primary: IComposableStrategy<'cowcentrated'>;
  dual: IComposableStrategy<'cowcentrated-dual'> | undefined;
  vaultType: ICowcentratedVaultType;
} {
  const primary = underlyings.find(
    (s): s is IComposableStrategy<'cowcentrated'> => s.id === 'cowcentrated'
  );
  if (!primary) {
    throw new Error('Cowcentrated underlying strategy missing');
  }
  const dual = underlyings.find(
    (s): s is IComposableStrategy<'cowcentrated-dual'> => s.id === 'cowcentrated-dual'
  );
  const { vaultType } = primary.getHelpers();
  if (!isCowcentratedVaultType(vaultType)) {
    throw new Error('Underlying vault type is not cowcentrated');
  }
  return { primary, dual, vaultType };
}
