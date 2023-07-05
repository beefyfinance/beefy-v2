import React, { memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { Transact } from './Transact/Transact';
import { Boosts } from './Boosts';
import { Minters } from './Minter';
import { ConicMigration } from '../ConicMigration';

export type ActionsProps = {
  vaultId: VaultEntity['id'];
};
export const Actions = memo<ActionsProps>(function Actions({ vaultId }) {
  return (
    <>
      <ConicMigration vaultId={vaultId} />
      <Transact vaultId={vaultId} />
      <Boosts vaultId={vaultId} />
      <Minters vaultId={vaultId} />
    </>
  );
});
