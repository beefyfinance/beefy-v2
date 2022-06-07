import { VaultEntity } from '../../../data/entities/vault';
import {
  selectBoostById,
  selectIsVaultPreStakedOrBoosted,
  selectPreStakeOrActiveBoostIds,
} from '../../../data/selectors/boosts';
import { BoostWidgetPastBoosts } from './BoostWidgetPastBoosts';
import { BoostWidgetActiveBoost } from './BoostWidgetActiveBoost';
import { useAppSelector } from '../../../../store';

export const BoostWidget = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const isBoosted = useAppSelector(state => selectIsVaultPreStakedOrBoosted(state, vaultId));

  const activeBoost = useAppSelector(state =>
    isBoosted ? selectBoostById(state, selectPreStakeOrActiveBoostIds(state, vaultId)[0]) : null
  );

  return (
    <>
      {isBoosted && <BoostWidgetActiveBoost boostId={activeBoost.id} />}
      <BoostWidgetPastBoosts vaultId={vaultId} />
    </>
  );
};
