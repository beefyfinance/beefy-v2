import { selectPastBoostIdsWithUserBalance } from '../../../../data/selectors/boosts.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import { useAppSelector } from '../../../../../store.ts';
import { BoostPastActionCard } from './BoostPastActionCard/BoostPastActionCard.tsx';
import { styled } from '@repo/styles/jsx';

export function PastBoosts({ vaultId }: { vaultId: BoostPromoEntity['id'] }) {
  const pastBoostsWithUserBalance = useAppSelector(state =>
    selectPastBoostIdsWithUserBalance(state, vaultId)
  );

  return (
    <ExpiredBoostContainer>
      {pastBoostsWithUserBalance.map(boostId => (
        <BoostPastActionCard boostId={boostId} key={boostId} />
      ))}
    </ExpiredBoostContainer>
  );
}

const ExpiredBoostContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});
