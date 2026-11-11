import { describe, expect, it } from 'vitest';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { selectVaultReplacementMigration } from './vaults.ts';

type Status = VaultEntity['status'];

// a CLM and its two wrappers, enough for the selector's type guards and wrapper lookups
function clmFamily(
  clm: string,
  opts: {
    replacementVaultId?: string;
    poolStatus?: Status;
    vaultStatus?: Status;
    noVault?: boolean;
  } = {}
) {
  const ids = {
    clm,
    pool: `${clm}-rp`,
    vault: opts.noVault ? undefined : `${clm}-vault`,
    pools: [`${clm}-rp`],
    vaults: opts.noVault ? [] : [`${clm}-vault`],
  };
  const vaults = [
    {
      id: clm,
      type: 'cowcentrated',
      status: 'active',
      cowcentratedIds: ids,
      replacementVaultId: opts.replacementVaultId,
    },
    {
      id: `${clm}-rp`,
      type: 'gov',
      subType: 'cowcentrated',
      status: opts.poolStatus ?? 'active',
      cowcentratedIds: ids,
    },
    ...(opts.noVault ?
      []
    : [
        {
          id: `${clm}-vault`,
          type: 'standard',
          subType: 'cowcentrated',
          status: opts.vaultStatus ?? 'active',
          cowcentratedIds: ids,
        },
      ]),
  ];
  return vaults;
}

function stateWith(...families: Array<ReturnType<typeof clmFamily>>) {
  const byId = Object.fromEntries(families.flat().map(v => [v.id, v]));
  return { entities: { vaults: { byId } } } as unknown as BeefyState;
}

describe('selectVaultReplacementMigration for CLM wrappers', () => {
  const old = clmFamily('old-clm', { replacementVaultId: 'new-clm' });

  it('sends vault holders to the new vault', () => {
    const state = stateWith(old, clmFamily('new-clm'));
    expect(selectVaultReplacementMigration(state, 'old-clm-vault')).toEqual({
      oldVaultId: 'old-clm-vault',
      newVaultId: 'new-clm-vault',
    });
  });

  it('sends pool holders to the new vault too', () => {
    const state = stateWith(old, clmFamily('new-clm'));
    expect(selectVaultReplacementMigration(state, 'old-clm-rp')).toEqual({
      oldVaultId: 'old-clm-rp',
      newVaultId: 'new-clm-vault',
    });
  });

  it('falls back to the new pool when the new CLM has no active vault', () => {
    expect(
      selectVaultReplacementMigration(
        stateWith(old, clmFamily('new-clm', { noVault: true })),
        'old-clm-rp'
      )?.newVaultId
    ).toBe('new-clm-rp');
    expect(
      selectVaultReplacementMigration(
        stateWith(old, clmFamily('new-clm', { vaultStatus: 'paused' })),
        'old-clm-vault'
      )?.newVaultId
    ).toBe('new-clm-rp');
  });

  it('accepts a replacement that points at the new vault instead of the new CLM', () => {
    const state = stateWith(
      clmFamily('old-clm', { replacementVaultId: 'new-clm-vault' }),
      clmFamily('new-clm')
    );
    expect(selectVaultReplacementMigration(state, 'old-clm-rp')?.newVaultId).toBe('new-clm-vault');
  });

  it('keeps pool holders in a pool when the replacement points at the new pool', () => {
    const state = stateWith(
      clmFamily('old-clm', { replacementVaultId: 'new-clm-rp' }),
      clmFamily('new-clm')
    );
    expect(selectVaultReplacementMigration(state, 'old-clm-rp')?.newVaultId).toBe('new-clm-rp');
    expect(selectVaultReplacementMigration(state, 'old-clm-vault')?.newVaultId).toBe(
      'new-clm-vault'
    );
  });

  it('sends pool holders to the new vault when the named new pool is not active', () => {
    const state = stateWith(
      clmFamily('old-clm', { replacementVaultId: 'new-clm-rp' }),
      clmFamily('new-clm', { poolStatus: 'paused' })
    );
    expect(selectVaultReplacementMigration(state, 'old-clm-rp')?.newVaultId).toBe('new-clm-vault');
  });

  it('sends vault holders to the new pool when the opt-out target has no active vault', () => {
    const state = stateWith(
      clmFamily('old-clm', { replacementVaultId: 'new-clm-rp' }),
      clmFamily('new-clm', { vaultStatus: 'eol' })
    );
    expect(selectVaultReplacementMigration(state, 'old-clm-vault')?.newVaultId).toBe('new-clm-rp');
  });

  it('resolves nothing when the replacement is in the same CLM family', () => {
    const state = stateWith(clmFamily('old-clm', { replacementVaultId: 'old-clm-vault' }));
    expect(selectVaultReplacementMigration(state, 'old-clm-rp')).toBeUndefined();
  });

  it('resolves nothing when no new wrapper is active', () => {
    const state = stateWith(old, clmFamily('new-clm', { vaultStatus: 'eol', poolStatus: 'eol' }));
    expect(selectVaultReplacementMigration(state, 'old-clm-rp')).toBeUndefined();
  });
});
