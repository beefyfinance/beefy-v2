import { useSelector } from 'react-redux';
import { VaultEntity } from '../../../data/entities/vault';
import { BeefyState } from '../../../../redux-types';
import {
  selectBoostById,
  selectIsVaultPreStakedOrBoosted,
  selectPreStakeOrActiveBoost,
} from '../../../data/selectors/boosts';
import { BoostWidgetPastBoosts } from './BoostWidgetPastBoosts';
import { BoostWidgetActiveBoost } from './BoostWidgetActiveBoost';

export const BoostWidget = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const isBoosted = useSelector((state: BeefyState) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );

  const activeBoost = useSelector((state: BeefyState) =>
    isBoosted ? selectBoostById(state, selectPreStakeOrActiveBoost(state, vaultId)[0]) : null
  );

  return (
    <>
      {isBoosted && <BoostWidgetActiveBoost boostId={activeBoost.id} />}
      <BoostWidgetPastBoosts vaultId={vaultId} />
    </>
  );
};
