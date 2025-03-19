import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { memo } from 'react';
import { ActivePast } from './ActivePast.tsx';

export type BoostsProps = {
  vaultId: VaultEntity['id'];
};
export const Boosts = memo(function Boosts({ vaultId }: BoostsProps) {
  return <ActivePast vaultId={vaultId} />;
});
