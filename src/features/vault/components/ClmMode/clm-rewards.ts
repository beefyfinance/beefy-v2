import type { VaultCowcentrated } from '../../../data/entities/vault.ts';

type CowcentratedIds = VaultCowcentrated['cowcentratedIds'];

/**
 * Whether a new deposit lands in the autocompounding wrapper when the user expresses no preference.
 * Product-flippable in one place; nothing else may decide this.
 */
export const CLM_REWARDS_DEFAULT_ON = true;

export type ClmRewardsVariant =
  /** both wrappers active: the deposit route is a real choice */
  | 'toggle'
  /** no active vault wrapper: a statement of what the product does, not a control */
  | 'info';

/**
 * Which shape the Rewards row takes. Derived from contract structure alone — never from reward
 * data. Whether anything is claimable today says nothing about who should collect what starts
 * streaming tomorrow, and the deposit is sticky. (`ids.vault`/`ids.pool` are the *active* wrapper
 * ids; a retired wrapper leaves them undefined and counts as absent here.)
 */
export function resolveClmRewardsVariant(ids: CowcentratedIds): ClmRewardsVariant {
  return ids.vault ? 'toggle' : 'info';
}

/** True when the group has no active vault wrapper, so no harvest and no performance fee exists */
export function isClmPoolOnly(ids: CowcentratedIds): boolean {
  return !ids.vault;
}
