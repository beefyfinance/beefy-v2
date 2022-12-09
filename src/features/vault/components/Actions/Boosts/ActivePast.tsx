import { VaultEntity } from '../../../../data/entities/vault';
import { memo } from 'react';
import { useAppSelector } from '../../../../../store';
import { selectVaultCurrentBoostIdWithStatus } from '../../../../data/selectors/boosts';
import { ActiveBoost } from './ActiveBoost';
import { PastBoosts } from './PastBoosts';
import { useTranslation } from 'react-i18next';

export type ActivePastProps = {
  vaultId: VaultEntity['id'];
};
export const ActivePast = memo<ActivePastProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectVaultCurrentBoostIdWithStatus(state, vaultId));

  return (
    <>
      {boost && (
        <ActiveBoost
          boostId={boost.id}
          title={t(boost.status === 'prestake' ? 'Boost-Upcoming' : 'Boost-Active')}
        />
      )}
      <PastBoosts vaultId={vaultId} />
    </>
  );
});
