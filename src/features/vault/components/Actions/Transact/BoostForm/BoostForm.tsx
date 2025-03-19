import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { Boosts } from '../../Boosts/Boosts.tsx';
import { styled } from '@repo/styles/jsx';

const BoostFormLoader = memo(function BoostFormLoader() {
  const vaultId = useAppSelector(selectTransactVaultId);
  return (
    <Container>
      <Boosts vaultId={vaultId} />;
    </Container>
  );
});

const Container = styled('div', {
  base: {
    padding: '16px',
    sm: {
      padding: '24px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BoostFormLoader;
