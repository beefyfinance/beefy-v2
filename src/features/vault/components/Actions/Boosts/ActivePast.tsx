import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { memo } from 'react';
import { useAppSelector } from '../../../../../store.ts';
import {
  selectUserHasPastBoostAndActiveBoost,
  selectVaultCurrentBoostIdWithStatus,
} from '../../../../data/selectors/boosts.ts';
import { ActiveBoost } from './ActiveBoost.tsx';
import { PastBoosts } from './PastBoosts.tsx';
import { styled } from '@repo/styles/jsx/';

export type ActivePastProps = {
  vaultId: VaultEntity['id'];
};
export const ActivePast = memo<ActivePastProps>(function ActivePast({ vaultId }) {
  const boost = useAppSelector(state => selectVaultCurrentBoostIdWithStatus(state, vaultId));
  const showDivider = useAppSelector(state => selectUserHasPastBoostAndActiveBoost(state, vaultId));

  return (
    <>
      <PastBoosts vaultId={vaultId} />
      {showDivider && <Divider />}
      {boost && <ActiveBoost boostId={boost.id} />}
    </>
  );
});

const Divider = styled('div', {
  base: {
    height: '1px',
    background: 'background.content.gray',
    borderRadius: '4px',
    opacity: '0.2',
    width: '90%',
    margin: '0 auto',
  },
});
