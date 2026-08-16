import { describe, expect, it } from 'vitest';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { buildVaultListRows, getRowAnchorId, rowFromAnchorId } from './vault-list-rows.ts';

function makeVault(overrides: {
  id: string;
  type?: string;
  subType?: string;
  status?: string;
  cowcentratedIds?: {
    clm: string;
    pool?: string;
    vault?: string;
    pools: string[];
    vaults: string[];
  };
}): VaultEntity {
  return {
    id: overrides.id,
    type: overrides.type ?? 'standard',
    subType: overrides.subType ?? 'standard',
    status: overrides.status ?? 'active',
    cowcentratedIds: overrides.cowcentratedIds,
  } as unknown as VaultEntity;
}

function makeFamily({
  clmId = 'clm',
  poolId = 'clm-rp',
  vaultId = 'clm-vault',
  poolActive = true,
  vaultActive = true,
}: {
  clmId?: string;
  poolId?: string;
  vaultId?: string;
  poolActive?: boolean;
  vaultActive?: boolean;
} = {}) {
  const cowcentratedIds = {
    clm: clmId,
    pool: poolActive ? poolId : undefined,
    vault: vaultActive ? vaultId : undefined,
    pools: [poolId],
    vaults: [vaultId],
  };
  const pool = makeVault({
    id: poolId,
    type: 'gov',
    subType: 'cowcentrated',
    status: poolActive ? 'active' : 'eol',
    cowcentratedIds,
  });
  const vault = makeVault({
    id: vaultId,
    type: 'standard',
    subType: 'cowcentrated',
    status: vaultActive ? 'active' : 'eol',
    cowcentratedIds,
  });
  return { pool, vault };
}

describe('getRowAnchorId', () => {
  it('anchors a CLM standard vault to its pool, any status', () => {
    const active = makeFamily();
    expect(getRowAnchorId(active.vault)).toBe(active.pool.id);

    const retired = makeFamily({ poolActive: false, vaultActive: false });
    expect(getRowAnchorId(retired.vault)).toBe(retired.pool.id);
  });

  it('anchors everything else to itself', () => {
    const { pool } = makeFamily();
    expect(getRowAnchorId(pool)).toBe(pool.id);
    const plain = makeVault({ id: 'plain' });
    expect(getRowAnchorId(plain)).toBe('plain');
    const poolLess = makeVault({
      id: 'orphan-vault',
      type: 'standard',
      subType: 'cowcentrated',
      cowcentratedIds: { clm: 'clm', pools: [], vaults: ['orphan-vault'] },
    });
    expect(getRowAnchorId(poolLess)).toBe('orphan-vault');
  });
});

describe('buildVaultListRows', () => {
  it('collapses a family into one row keyed by the pool', () => {
    const { pool, vault } = makeFamily();
    const rows = buildVaultListRows([vault, pool], () => true);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(pool.id);
    expect(rows[0].members.map(m => m.id)).toEqual([vault.id, pool.id]);
  });

  it('emits a row when either member passes, tracking passing members', () => {
    const { pool, vault } = makeFamily();
    const rows = buildVaultListRows([pool, vault], v => v.id === vault.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].passingMemberIds).toEqual(new Set([vault.id]));
  });

  it('drops rows where no member passes', () => {
    const { pool, vault } = makeFamily();
    const plain = makeVault({ id: 'plain' });
    const rows = buildVaultListRows([pool, vault, plain], v => v.id === 'plain');
    expect(rows.map(r => r.id)).toEqual(['plain']);
  });

  it('preserves first-seen order of the input', () => {
    const { pool, vault } = makeFamily();
    const before = makeVault({ id: 'before' });
    const after = makeVault({ id: 'after' });
    const rows = buildVaultListRows([before, vault, after, pool], () => true);
    expect(rows.map(r => r.id)).toEqual(['before', pool.id, 'after']);
  });
});

describe('rowFromAnchorId', () => {
  function makeState(vaults: VaultEntity[]): BeefyState {
    return {
      entities: {
        vaults: {
          byId: Object.fromEntries(vaults.map(v => [v.id, v])),
        },
      },
    } as unknown as BeefyState;
  }

  it('rebuilds a family row with both members from the pool anchor', () => {
    const { pool, vault } = makeFamily();
    const row = rowFromAnchorId(makeState([pool, vault]), pool.id);
    expect(row.id).toBe(pool.id);
    expect(row.members.map(m => m.id)).toEqual([pool.id, vault.id]);
  });

  it('rebuilds a singleton row for non-family anchors', () => {
    const plain = makeVault({ id: 'plain' });
    const row = rowFromAnchorId(makeState([plain]), 'plain');
    expect(row.members.map(m => m.id)).toEqual(['plain']);
  });
});
