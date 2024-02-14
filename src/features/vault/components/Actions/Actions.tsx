import React, { memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { Transact } from './Transact/Transact';
import { Boosts } from './Boosts';
import { Minters } from './Minter';
import { TransactDebugger } from './Transact/TransactDebugger';
import { Migration } from '../Migation';
import { isDevelopment } from '../../../data/utils/feature-flags';
import { DisplacedBalances } from '../DisplacedBalances';
import { NoSafuRisks } from '../NoSafuRisks';

export type ActionsProps = {
  vaultId: VaultEntity['id'];
};
export const Actions = memo<ActionsProps>(function Actions({ vaultId }) {
  return (
    <>
      {isDevelopment ? <TransactDebugger /> : null}
      <Migration vaultId={vaultId} />
      <DisplacedBalances vaultId={vaultId} />
      <NoSafuRisks vaultId={vaultId} isTitle={true} />
      <Transact vaultId={vaultId} />
      <Boosts vaultId={vaultId} />
      <Minters vaultId={vaultId} />
    </>
  );
});
