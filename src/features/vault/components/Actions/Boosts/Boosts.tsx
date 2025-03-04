import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { selectShouldDisplayVaultBoost } from '../../../../data/selectors/boosts.ts';
import { useAppSelector } from '../../../../../store.ts';
import { memo } from 'react';
import { ActivePast } from './ActivePast.tsx';

export type BoostsProps = {
  vaultId: VaultEntity['id'];
};
export const Boosts = memo(function Boosts({ vaultId }: BoostsProps) {
  const shouldDisplay = useAppSelector(state => selectShouldDisplayVaultBoost(state, vaultId));
  if (!shouldDisplay) {
    return null;
  }

  return <ActivePast vaultId={vaultId} />;
});
