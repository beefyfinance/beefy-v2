import { lazy, memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { Transact } from './Transact/Transact.tsx';
import { Minters } from './Minter/Minters.tsx';
import { Migration } from '../Migation/Migration.tsx';
import { DisplacedBalances } from '../DisplacedBalances/DisplacedBalances.tsx';
import { NoSafuRisks } from '../NoSafuRisks/NoSafuRisks.tsx';

const TransactDebugger =
  import.meta.env.DEV ?
    lazy(() => import('./Transact/TransactDebugger/TransactDebugger.tsx'))
  : undefined;

export type ActionsProps = {
  vaultId: VaultEntity['id'];
};
export const Actions = memo(function Actions({ vaultId }: ActionsProps) {
  return (
    <>
      {TransactDebugger ?
        <TransactDebugger vaultId={vaultId} />
      : null}
      <Migration vaultId={vaultId} />
      <DisplacedBalances vaultId={vaultId} />
      <NoSafuRisks vaultId={vaultId} isTitle={true} />
      <Transact vaultId={vaultId} />
      <Minters vaultId={vaultId} />
    </>
  );
});
