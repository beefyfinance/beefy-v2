import {
  getCowcentratedPool,
  getCowcentratedVault,
  isCowcentratedGovVault,
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../entities/vault.ts';
import { selectVaultById, selectVaultByIdOrUndefined } from '../selectors/vaults.ts';
import type { BeefyState } from '../store/types.ts';

export type VaultListRow = {
  /** anchor vault id — a real vault id (the CLM gov pool for collapsed families) */
  id: VaultEntity['id'];
  /** the anchor + (for CLM pool anchors) its standard vault sibling, any status */
  members: VaultEntity[];
  /** members that passed the filters; value sorts use all members, relevance ranking must use these only */
  passingMemberIds: Set<VaultEntity['id']>;
};

/** CLM standard vaults collapse into their (any-status) gov pool's row; everything else anchors itself */
export function getRowAnchorId(vault: VaultEntity): VaultEntity['id'] {
  if (isCowcentratedStandardVault(vault)) {
    return getCowcentratedPool(vault) ?? vault.id;
  }
  return vault.id;
}

/** Group vaults into list rows; a row is emitted iff at least one member passes.
 * Row order = first-seen member order of the input. */
export function buildVaultListRows(
  vaults: VaultEntity[],
  passes: (vault: VaultEntity) => boolean
): VaultListRow[] {
  const rowsByAnchor = new Map<VaultEntity['id'], VaultListRow>();
  for (const vault of vaults) {
    const anchorId = getRowAnchorId(vault);
    let row = rowsByAnchor.get(anchorId);
    if (!row) {
      row = { id: anchorId, members: [], passingMemberIds: new Set() };
      rowsByAnchor.set(anchorId, row);
    }
    row.members.push(vault);
    if (passes(vault)) {
      row.passingMemberIds.add(vault.id);
    }
  }
  return Array.from(rowsByAnchor.values()).filter(row => row.passingMemberIds.size > 0);
}

/** Rebuild a row from its stored anchor id for resort-only passes.
 * passingMemberIds is filled with all members: only relevance ranking distinguishes passing
 * members, and it never runs on a resort-only pass. */
export function rowFromAnchorId(state: BeefyState, anchorId: VaultEntity['id']): VaultListRow {
  const anchor = selectVaultById(state, anchorId);
  const members = [anchor];
  if (isCowcentratedGovVault(anchor)) {
    const siblingId = getCowcentratedVault(anchor);
    const sibling = siblingId ? selectVaultByIdOrUndefined(state, siblingId) : undefined;
    if (sibling) {
      members.push(sibling);
    }
  }
  return { id: anchorId, members, passingMemberIds: new Set(members.map(m => m.id)) };
}
