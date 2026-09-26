import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isGovVault,
  isVaultRetired,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';

/** Which position of a CLM a source is: a wrapper side, or CLM tokens never deposited */
export type ClmSide = 'vault' | 'pool' | 'bare';

export type DepositFromVaultGroupId = 'thisClm' | 'retired' | 'vault' | 'pool' | 'clm';

type EntryLike = { vaultId: VaultEntity['id']; balanceUsd: BigNumber };

export type DepositFromVaultRow<T extends EntryLike> =
  | { kind: 'single'; entry: T; side: ClmSide | undefined }
  /** several positions of one CLM behind a single row */
  | { kind: 'clm'; clmId: VaultEntity['id']; entries: T[]; totalUsd: BigNumber };

export type DepositFromVaultGroup<T extends EntryLike> = {
  id: DepositFromVaultGroupId;
  rows: DepositFromVaultRow<T>[];
};

const SIDE_ORDER: Record<ClmSide, number> = { vault: 0, pool: 1, bare: 2 };

/** locale keys naming each position, matching the withdraw tab */
export const CLM_SIDE_NAME: Record<ClmSide, string> = {
  vault: 'Transact-ClmMode-Vault',
  pool: 'Transact-ClmMode-Pool',
  bare: 'Transact-DepositFromVault-NotDeposited',
};

export function getClmSide(vault: VaultEntity): ClmSide | undefined {
  if (isCowcentratedStandardVault(vault)) return 'vault';
  if (isCowcentratedGovVault(vault)) return 'pool';
  if (isCowcentratedLikeVault(vault)) return 'bare';
  return undefined;
}

export function sortByClmSide<T extends EntryLike>(
  entries: T[],
  vaultById: Record<VaultEntity['id'], VaultEntity | undefined>
): T[] {
  const order = (entry: T) => {
    const vault = vaultById[entry.vaultId];
    const side = vault && getClmSide(vault);
    return side ? SIDE_ORDER[side] : 0;
  };
  return [...entries].sort((a, b) => order(a) - order(b));
}

const sumUsd = (entries: EntryLike[]) =>
  entries.reduce((sum, entry) => sum.plus(entry.balanceUsd), BIG_ZERO);

/**
 * Picker groups: the destination's own CLM first (its positions move without a swap), retired next,
 * then the rest by total value. Elsewhere a CLM held on several sides folds into one row.
 * Entries are expected largest first, which rows and groups keep.
 */
export function groupDepositFromVaultEntries<T extends EntryLike>(
  entries: T[],
  vaultById: Record<VaultEntity['id'], VaultEntity | undefined>,
  destClmId: VaultEntity['id'] | undefined
): DepositFromVaultGroup<T>[] {
  const buckets = new Map<DepositFromVaultGroupId, T[]>();
  for (const entry of entries) {
    const vault = vaultById[entry.vaultId];
    if (!vault) continue;
    const clmId = isCowcentratedLikeVault(vault) ? vault.cowcentratedIds.clm : undefined;
    const groupId: DepositFromVaultGroupId =
      clmId && clmId === destClmId ? 'thisClm'
      : isVaultRetired(vault) ? 'retired'
      : clmId ? 'clm'
      : isGovVault(vault) ? 'pool'
      : 'vault';
    buckets.set(groupId, [...(buckets.get(groupId) ?? []), entry]);
  }

  const toRows = (
    groupId: DepositFromVaultGroupId,
    groupEntries: T[]
  ): DepositFromVaultRow<T>[] => {
    const rows: DepositFromVaultRow<T>[] = [];
    const clmRowIndex = new Map<VaultEntity['id'], number>();
    for (const entry of groupEntries) {
      const vault = vaultById[entry.vaultId]!;
      const side = getClmSide(vault);
      const clmId = isCowcentratedLikeVault(vault) ? vault.cowcentratedIds.clm : undefined;
      const index = clmId && groupId !== 'thisClm' ? clmRowIndex.get(clmId) : undefined;
      if (index === undefined) {
        if (clmId) clmRowIndex.set(clmId, rows.length);
        rows.push({ kind: 'single', entry, side });
        continue;
      }
      const row = rows[index];
      const folded = row.kind === 'single' ? [row.entry, entry] : [...row.entries, entry];
      rows[index] = {
        kind: 'clm',
        clmId: clmId!,
        entries: sortByClmSide(folded, vaultById),
        totalUsd: sumUsd(folded),
      };
    }
    return rows;
  };

  const pinned = (['thisClm', 'retired'] as const).filter(id => buckets.has(id));
  const rest = [...buckets.keys()]
    .filter(id => id !== 'thisClm' && id !== 'retired')
    .sort((a, b) => sumUsd(buckets.get(b)!).comparedTo(sumUsd(buckets.get(a)!)) ?? 0);
  return [...pinned, ...rest].map(id => ({ id, rows: toRows(id, buckets.get(id)!) }));
}
