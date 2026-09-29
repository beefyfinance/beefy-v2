import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { groupDepositFromVaultEntries } from './groups.ts';

const clm = (id: string, status = 'active') => {
  const ids = {
    clm: id,
    pool: `${id}-rp`,
    vault: `${id}-vault`,
    pools: [`${id}-rp`],
    vaults: [`${id}-vault`],
  };
  return [
    { id, type: 'cowcentrated', status, cowcentratedIds: ids },
    { id: `${id}-rp`, type: 'gov', subType: 'cowcentrated', status, cowcentratedIds: ids },
    { id: `${id}-vault`, type: 'standard', subType: 'cowcentrated', status, cowcentratedIds: ids },
  ];
};
const vaultById = Object.fromEntries(
  [
    ...clm('a'),
    ...clm('b'),
    ...clm('old', 'eol'),
    { id: 'plain', type: 'standard', subType: 'standard', status: 'active' },
    { id: 'gov', type: 'gov', subType: 'multi', status: 'active' },
  ].map(v => [v.id, v as unknown as VaultEntity])
);

// largest first, as the picker's entries are
const entries = [
  ['a-rp', 4000],
  ['plain', 3000],
  ['b-rp', 2500],
  ['a-vault', 1375],
  ['gov', 700],
  ['a', 625],
  ['old-vault', 50],
].map(([vaultId, usd]) => ({ vaultId: vaultId as string, balanceUsd: new BigNumber(usd) }));

const shape = (destClmId?: string) =>
  groupDepositFromVaultEntries(entries, vaultById, destClmId).map(group => ({
    id: group.id,
    rows: group.rows.map(row =>
      row.kind === 'single' ?
        `${row.entry.vaultId}${row.side ? `:${row.side}` : ''}`
      : `${row.clmId}[${row.entries.map(e => e.vaultId).join(',')}]`
    ),
  }));

describe('groupDepositFromVaultEntries', () => {
  it('folds a CLM held on several sides into one row, sides in withdraw-tab order', () => {
    expect(shape()).toEqual([
      { id: 'retired', rows: ['old-vault:vault'] },
      { id: 'clm', rows: ['a[a-vault,a-rp,a]', 'b-rp:pool'] },
      { id: 'vault', rows: ['plain'] },
      { id: 'pool', rows: ['gov'] },
    ]);
  });

  it("leads with the destination CLM's own positions, unfolded", () => {
    expect(shape('a')).toEqual([
      { id: 'thisClm', rows: ['a-rp:pool', 'a-vault:vault', 'a:bare'] },
      { id: 'retired', rows: ['old-vault:vault'] },
      { id: 'vault', rows: ['plain'] },
      { id: 'clm', rows: ['b-rp:pool'] },
      { id: 'pool', rows: ['gov'] },
    ]);
  });
});
