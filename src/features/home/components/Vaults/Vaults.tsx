import { memo } from 'react';
import { VaultsHeader } from './components/VaultsHeader/VaultsHeader.tsx';
import { VaultsList } from './components/VaultsList/VaultsList.tsx';
import { SimplifiedVaultsList } from './components/SimplifiedVaults/SimplifiedVaultsList.tsx';
import { styled } from '@repo/styles/jsx';
import { Container } from '../../../../components/Container/Container.tsx';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectVaultsViewMode } from '../../../data/selectors/vaults-list.ts';

export const Vaults = memo(function Vaults() {
  const isMobile = useBreakpoint({ to: 'xs' });
  const viewMode = useAppSelector(selectVaultsViewMode);

  const maxWidth = isMobile ? 'xl' : 'lg';
  return (
    <Container maxWidth={maxWidth} noPadding={isMobile}>
      <VaultsContainer>
        <VaultsHeader />
        {viewMode === 'simplified' ?
          <SimplifiedVaultsList />
        : <VaultsList />}
      </VaultsContainer>
    </Container>
  );
});

const VaultsContainer = styled('div', {
  base: {
    marginTop: '10px',
    borderRadius: '12px',
    contain: 'paint',
  },
});
