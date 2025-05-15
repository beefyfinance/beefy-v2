import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectPastBoostIdsWithUserBalance } from '../../../../data/selectors/balance.ts';
import { selectVaultCurrentBoostId } from '../../../../data/selectors/boosts.ts';
import { selectTransactVaultId } from '../../../../data/selectors/transact.ts';
import { ActiveBoost } from './ActiveBoost.tsx';
import { PastBoosts } from './PastBoosts.tsx';

export const Boosts = memo(function Boosts() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const boostId = useAppSelector(state => selectVaultCurrentBoostId(state, vaultId));
  const hasPast =
    useAppSelector(state => selectPastBoostIdsWithUserBalance(state, vaultId)).length > 0;
  const showDivider = hasPast && !!boostId;

  return (
    <Container>
      {hasPast && <PastBoosts vaultId={vaultId} />}
      {showDivider && <Divider />}
      {boostId && <ActiveBoost boostId={boostId} />}
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
