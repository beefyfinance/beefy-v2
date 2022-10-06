import { VaultEntity } from '../../../../data/entities/vault';
import { memo } from 'react';
import { useAppSelector } from '../../../../../store';
import {
  selectIsVaultPreStakedOrBoosted,
  selectPreStakeOrActiveBoostIds,
} from '../../../../data/selectors/boosts';
import { first } from 'lodash';
import { ActiveBoost } from './ActiveBoost';
import { PastBoosts } from './PastBoosts';

export type ActivePastProps = {
  vaultId: VaultEntity['id'];
};
export const ActivePast = memo<ActivePastProps>(function ({ vaultId }) {
  const hasActiveBoost = useAppSelector(state => selectIsVaultPreStakedOrBoosted(state, vaultId));
  const activeBoostId = useAppSelector(state =>
    hasActiveBoost ? first(selectPreStakeOrActiveBoostIds(state, vaultId)) : null
  );
  return (
    <>
      {hasActiveBoost && <ActiveBoost boostId={activeBoostId} />}
      <PastBoosts vaultId={vaultId} />
    </>
  );
});
