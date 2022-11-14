import { VaultEntity } from '../../../data/entities/vault';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
  selectIsVaultPrestakedBoost,
  selectPreStakeVaultBoostIds,
  selectShouldDisplayBoostWidget,
} from '../../../data/selectors/boosts';
import { BoostWidgetPastBoosts } from './BoostWidgetPastBoosts';
import { BoostWidgetActiveBoost } from './BoostWidgetActiveBoost';
import { useAppSelector } from '../../../../store';
import { useTranslation } from 'react-i18next';

export const BoostWidget = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const displayBoostWidget = useAppSelector(state =>
    selectShouldDisplayBoostWidget(state, vaultId)
  );
  const { t } = useTranslation();

  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));

  const activeBoost = useAppSelector(state =>
    isBoosted ? selectBoostById(state, selectActiveVaultBoostIds(state, vaultId)[0]) : null
  );

  const isPrestakeBoost = useAppSelector(state => selectIsVaultPrestakedBoost(state, vaultId));

  const prestakeBoost = useAppSelector(state =>
    isPrestakeBoost ? selectBoostById(state, selectPreStakeVaultBoostIds(state, vaultId)[0]) : null
  );

  return (
    <>
      {displayBoostWidget ? (
        <>
          {isBoosted && (
            <BoostWidgetActiveBoost title={t('Boost-Active')} boostId={activeBoost.id} />
          )}
          {isPrestakeBoost && (
            <BoostWidgetActiveBoost title={t('Boost-Upcoming')} boostId={prestakeBoost.id} />
          )}
          <BoostWidgetPastBoosts vaultId={vaultId} />
        </>
      ) : null}
    </>
  );
};
