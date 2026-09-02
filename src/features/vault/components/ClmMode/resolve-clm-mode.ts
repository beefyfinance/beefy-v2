import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import type { VaultCowcentrated, VaultEntity } from '../../../data/entities/vault.ts';
import { CLM_REWARDS_DEFAULT_ON } from './clm-rewards.ts';

export type ClmMode = 'vault' | 'pool';

type CowcentratedIds = VaultCowcentrated['cowcentratedIds'];

/**
 * Which yield mode the deposit form starts on. Re-derived as balances load, until the user picks a
 * mode themselves — there is no URL state, the toggle does not change what the page shows.
 */
export function resolveClmMode(
  ids: CowcentratedIds,
  heldVault: boolean,
  heldPool: boolean,
  isWithdraw: boolean
): ClmMode {
  // follow the user's money when they are in exactly one side
  if (heldVault !== heldPool) {
    const held: ClmMode = heldVault ? 'vault' : 'pool';
    // withdraw takes from wherever the position is, retired or not; deposit must not start on a
    // wrapper that no longer accepts funds, or the form shows "retired" with no way to switch
    if (isWithdraw || (held === 'vault' ? !!ids.vault : !!ids.pool)) {
      return held;
    }
  }
  // both wrappers available: product decides, in one place
  if (ids.vault && ids.pool) {
    return CLM_REWARDS_DEFAULT_ON ? 'vault' : 'pool';
  }
  // default to the active autocompounding side
  if (ids.vault) {
    return 'vault';
  }
  if (ids.pool) {
    return 'pool';
  }
  return ids.vaults.length > 0 ? 'vault' : 'pool';
}

/**
 * Which side's position the page reports on. Follows the user's money, largest first — never the
 * yield mode, which only routes new deposits. `undefined` when they hold neither side.
 */
export function pickClmPositionSide(vaultUsd: BigNumber, poolUsd: BigNumber): ClmMode | undefined {
  if (vaultUsd.lte(BIG_ZERO) && poolUsd.lte(BIG_ZERO)) {
    return undefined;
  }
  return poolUsd.gt(vaultUsd) ? 'pool' : 'vault';
}

/** The vault id a mode maps to: active wrapper preferred, else most recent, else the CLM itself */
export function clmModeToVaultId(ids: CowcentratedIds, mode: ClmMode): VaultEntity['id'] {
  const id = mode === 'vault' ? (ids.vault ?? ids.vaults[0]) : (ids.pool ?? ids.pools[0]);
  return id ?? ids.clm;
}
