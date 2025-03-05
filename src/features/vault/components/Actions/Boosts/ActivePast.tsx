import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { memo } from 'react';
import { useAppSelector } from '../../../../../store.ts';
import { selectVaultCurrentBoostIdWithStatus } from '../../../../data/selectors/boosts.ts';
import { ActiveBoost } from './ActiveBoost.tsx';
import { PastBoosts } from './PastBoosts.tsx';

export type ActivePastProps = {
  vaultId: VaultEntity['id'];
};
export const ActivePast = memo<ActivePastProps>(function ActivePast({ vaultId }) {
  const boost = useAppSelector(state => selectVaultCurrentBoostIdWithStatus(state, vaultId));

  return (
    <>
      {boost && <ActiveBoost boostId={boost.id} />}
      <PastBoosts vaultId={vaultId} />
    </>
  );
});
