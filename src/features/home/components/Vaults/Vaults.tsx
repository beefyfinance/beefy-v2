import { memo, useMemo } from 'react';
import { VaultsHeader } from './components/VaultsHeader/VaultsHeader.tsx';
import { VaultsList } from './components/VaultsList/VaultsList.tsx';
import { styled } from '@repo/styles/jsx';
import { Container } from '../../../../components/Container/Container.tsx';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';

export const Vaults = memo(function Vaults() {
  const isMobile = useBreakpoint({ to: 'xs' });

  const maxWidth = useMemo(() => {
    return isMobile ? 'xl' : 'lg';
  }, [isMobile]);
  return (
    <Container maxWidth={maxWidth} noPadding={isMobile}>
      <VaultsContainer>
        <VaultsHeader />
        <VaultsList />
      </VaultsContainer>
    </Container>
  );
});

const VaultsContainer = styled('div', {
  base: {
    marginTop: '8px',
    borderRadius: '12px',
    contain: 'paint',
  },
});
