import type { VaultEntity } from '../../../../data/entities/vault';
import { memo } from 'react';
import { useAppSelector } from '../../../../../store';
import { selectVaultCurrentBoostIdWithStatus } from '../../../../data/selectors/boosts';
import { ActiveBoost } from './ActiveBoost';
import { PastBoosts } from './PastBoosts';

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
