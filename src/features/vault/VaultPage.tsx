import type { PropsWithChildren } from 'react';
import { lazy, memo } from 'react';
import { Navigate, useParams } from 'react-router';
import { VaultMeta } from '../../components/Meta/VaultMeta.tsx';
import { TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { useAppSelector } from '../data/store/hooks.ts';
import { type VaultEntity } from '../data/entities/vault.ts';
import { selectVaultIdForVaultPage } from '../data/selectors/vaults.ts';
import { Actions } from './components/Actions/Actions.tsx';
import { VaultBanners } from './components/Banners/VaultBanners.tsx';
import { VaultHeader } from './components/VaultHeader/VaultHeader.tsx';
import { VaultsStats } from './components/VaultsStats/VaultsStats.tsx';
import { MainAreaTabs } from './components/MainAreaTabs/MainAreaTabs.tsx';
import { PartnersAreaTabs } from './components/PartnersAreaTabs/PartnersAreaTabs.tsx';
import { BalancesTable } from './components/BalancesTable/BalancesTable.tsx';
import { styled } from '@repo/styles/jsx';

const NotFoundPage = lazy(() => import('../../features/pagenotfound/NotFoundPage.tsx'));

type VaultUrlParams = {
  id: VaultEntity['id'];
};

const VaultPage = memo(function VaultPage() {
  const { id: maybeId } = useParams<VaultUrlParams>();
  const idOrStatus = useAppSelector(state => selectVaultIdForVaultPage(state, maybeId));
  if (idOrStatus === 'loading') {
    return <TechLoader text="Loading..." />;
  } else if (idOrStatus === 'not-found') {
    return <NotFoundPage />;
  } else if (idOrStatus !== maybeId) {
    return <Navigate to={`/vault/${idOrStatus}`} />;
  }
  return <VaultContent vaultId={idOrStatus} />;
});

type VaultContentProps = PropsWithChildren<{
  vaultId: VaultEntity['id'];
}>;

const VaultContent = memo(function VaultContent({ vaultId }: VaultContentProps) {
  return (
    <PageContainer>
      <VaultMeta vaultId={vaultId} />
      <VaultBanners vaultId={vaultId} />

      {/* Main Grid Layout - 2 columns */}
      <ContentGrid>
        {/* Left Column */}
        <LeftColumn>
          {/* Vault Header Row */}
          <HeaderArea>
            <VaultHeader vaultId={vaultId} />
            <VaultsStats vaultId={vaultId} />
          </HeaderArea>

          {/* Main Area */}
          <MainArea>
            <MainAreaTabs vaultId={vaultId} />
          </MainArea>

          {/* Balances Section */}
          <BalancesArea>
            <BalancesTable />
          </BalancesArea>
        </LeftColumn>

        {/* Right Column - Actions 70% + Partners 30% */}
        <RightColumn>
          {/* Actions Area - 70% */}
          <ActionsArea>
            <Actions vaultId={vaultId} />
          </ActionsArea>

          {/* Partners Area - 30% */}
          <PartnersArea>
            <PartnersAreaTabs vaultId={vaultId} />
          </PartnersArea>
        </RightColumn>
      </ContentGrid>
    </PageContainer>
  );
});

const PageContainer = styled('div', {
  base: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});

const ContentGrid = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    flex: 1,
    overflow: 'hidden',
    md: {
      gridTemplateColumns: '1fr 380px',
    },
    lg: {
      gridTemplateColumns: '1fr 420px',
    },
  },
});

const LeftColumn = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid',
    borderColor: 'bayOfMany',
    order: 1,
    md: {
      order: 0,
    },
  },
});

const HeaderArea = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px 12px',
    borderBottom: '1px solid',
    borderColor: 'bayOfMany',
    flexShrink: 0,
  },
});

const MainArea = styled('div', {
  base: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderBottom: '1px solid',
    borderColor: 'bayOfMany',
  },
});

const BalancesArea = styled('div', {
  base: {
    overflow: 'auto',
    flexShrink: 0,
    maxHeight: '200px',
  },
});

const RightColumn = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    order: 0,
    md: {
      order: 1,
    },
  },
});

const ActionsArea = styled('div', {
  base: {
    flex: 7,
    borderBottom: '1px solid',
    borderColor: 'bayOfMany',
    overflow: 'auto',
    minHeight: 0,
  },
});

const PartnersArea = styled('div', {
  base: {
    flex: 3,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default VaultPage;
