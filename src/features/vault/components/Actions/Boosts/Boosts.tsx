import { VaultEntity } from '../../../../data/entities/vault';
import { selectShouldDisplayVaultBoost } from '../../../../data/selectors/boosts';
import { useAppSelector } from '../../../../../store';
import { memo } from 'react';
import { ActivePast } from './ActivePast';

export type BoostsProps = {
  vaultId: VaultEntity['id'];
};
export const Boosts = memo<BoostsProps>(function ({ vaultId }) {
  const shouldDisplay = useAppSelector(state => selectShouldDisplayVaultBoost(state, vaultId));
  if (!shouldDisplay) {
    return null;
  }

  return <ActivePast vaultId={vaultId} />;
});
