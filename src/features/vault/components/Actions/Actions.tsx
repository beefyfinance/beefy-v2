import { lazy, memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { Transact } from './Transact/Transact';
import { Boosts } from './Boosts';
import { Minters } from './Minter';
import { Migration } from '../Migation';
import { DisplacedBalances } from '../DisplacedBalances';
import { NoSafuRisks } from '../NoSafuRisks';

const TransactDebugger = import.meta.env.DEV
  ? lazy(() =>
      import(`./Transact/TransactDebugger/TransactDebugger`).then(module => ({
        default: module.TransactDebugger,
      }))
    )
  : undefined;

export type ActionsProps = {
  vaultId: VaultEntity['id'];
};
export const Actions = memo<ActionsProps>(function Actions({ vaultId }) {
  return (
    <>
      {TransactDebugger ? <TransactDebugger vaultId={vaultId} /> : null}
      <Migration vaultId={vaultId} />
      <DisplacedBalances vaultId={vaultId} />
      <NoSafuRisks vaultId={vaultId} isTitle={true} />
      <Transact vaultId={vaultId} />
      <Boosts vaultId={vaultId} />
      <Minters vaultId={vaultId} />
    </>
  );
});
