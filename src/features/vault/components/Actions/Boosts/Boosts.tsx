import { memo, useMemo } from 'react';
import { useAppSelector } from '../../../../../store.ts';
import {
  selectPastBoostIdsWithUserBalance,
  selectVaultCurrentBoostIdWithStatus,
} from '../../../../data/selectors/boosts.ts';
import { ActiveBoost } from './ActiveBoost.tsx';
import { PastBoosts } from './PastBoosts.tsx';
import { styled } from '@repo/styles/jsx';
import { selectTransactVaultId } from '../../../../data/selectors/transact.ts';

export const Boosts = memo(function Boosts() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const boost = useAppSelector(state => selectVaultCurrentBoostIdWithStatus(state, vaultId));
  const hasPast =
    useAppSelector(state => selectPastBoostIdsWithUserBalance(state, vaultId)).length > 0;
  const showDivider = useMemo(() => hasPast && boost, [hasPast, boost]);

  return (
    <Container>
      {hasPast && <PastBoosts vaultId={vaultId} />}
      {showDivider && <Divider />}
      {boost && <ActiveBoost boostId={boost.id} />}
    </Container>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    sm: {
      padding: '24px',
    },
  },
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

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default Boosts;
