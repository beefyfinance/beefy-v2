import { VaultEntity } from '../../../data/entities/vault';
import {
  selectBoostById,
  selectIsVaultPrestakedBoost,
  selectIsVaultPreStakedOrBoosted,
  selectPreStakeOrActiveBoostIds,
  selectShouldDisplayBoostWidget,
} from '../../../data/selectors/boosts';
import { BoostWidgetPastBoosts } from './BoostWidgetPastBoosts';
import { BoostWidgetActiveBoost } from './BoostWidgetActiveBoost';
import { useAppSelector } from '../../../../store';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const BoostWidget = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const displayBoostWidget = useAppSelector(state =>
    selectShouldDisplayBoostWidget(state, vaultId)
  );

  const { t } = useTranslation();

  const isBoosted = useAppSelector(state => selectIsVaultPreStakedOrBoosted(state, vaultId));

  const activeBoost = useAppSelector(state =>
    isBoosted ? selectBoostById(state, selectPreStakeOrActiveBoostIds(state, vaultId)[0]) : null
  );

  const isPrestakeBoost = useAppSelector(state => selectIsVaultPrestakedBoost(state, vaultId));

  const activePrestakeTitle = useMemo(() => {
    return isPrestakeBoost ? 'Boost-Upcoming' : 'Boost-Active';
  }, [isPrestakeBoost]);

  if (!displayBoostWidget) {
    return null;
  }

  return (
    <>
      {isBoosted && (
        <BoostWidgetActiveBoost title={t(activePrestakeTitle)} boostId={activeBoost.id} />
      )}
      <BoostWidgetPastBoosts vaultId={vaultId} />
    </>
  );
};
