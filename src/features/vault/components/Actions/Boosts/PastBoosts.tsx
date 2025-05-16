import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import { selectPastBoostIdsWithUserBalance } from '../../../../data/selectors/balance.ts';
import { BoostPastActionCard } from './BoostPastActionCard/BoostPastActionCard.tsx';

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
