import { memo } from 'react';
import { ChainButtonFilter } from './components/ChainFilters/ChainButtonFilter.tsx';
import { ChainDropdownFilter } from './components/ChainFilters/ChainDropdownFilter.tsx';
import { UserCategoryButtonFilter } from './components/UserCategoryFilters/UserCategoryButtonFilter.tsx';
import { AssetTypeButtonFilter } from './components/AssetTypeFilters/AssetTypeButtonFilter.tsx';
import { ExtendedFiltersButtonDropdown } from './components/ExtendedFilters/ExtendedFiltersButtonDropdown.tsx';
import { ClearFiltersButton } from './components/ClearFiltersButton/ClearFiltersButton.tsx';
import { VaultCategoryButtonFilter } from './components/VaultCategoryFilters/VaultCategoryButtonFilter.tsx';
import { StrategyTypeButtonFilter } from './components/StrategyTypeFilters/StrategyTypeButtonFilter.tsx';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { styled } from '@repo/styles/jsx';
import { ExtendedFiltersButtonSidebar } from './components/ExtendedFilters/ExtendedFiltersButtonSidebar.tsx';

export const Filters = memo(function Filters() {
  const isDesktop = useBreakpoint({ from: 'lg' });

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
});

const MobileLayout = memo(function MobileLayout() {
  return (
    <Layout>
      <Top>
        <UserCategoryButtonFilter />
      </Top>
      <Bottom>
        <Left>
          <ChainDropdownFilter />
        </Left>
        <Right>
          <ExtendedFiltersButtonSidebar />
          <ClearFiltersButton />
        </Right>
      </Bottom>
    </Layout>
  );
});

const DesktopLayout = memo(function DesktopLayout() {
  return (
    <Layout>
      <Top>
        <ChainButtonFilter />
      </Top>
      <Bottom>
        <Left>
          <UserCategoryButtonFilter />
        </Left>
        <Right>
          <VaultCategoryButtonFilter />
          <AssetTypeButtonFilter />
          <StrategyTypeButtonFilter />
          <ExtendedFiltersButtonDropdown />
          <ClearFiltersButton />
        </Right>
      </Bottom>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    sm: {
      gap: '16px',
    },
  },
});

const Top = styled('div', {
  base: {
    width: '100%',
  },
});

const Bottom = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: 'inherit',
    md: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(0px, 1fr))',
    },
    lg: {
      display: 'flex',
      flexDirection: 'row',
    },
  },
});

const Left = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'inherit',
    gap: 'inherit',
    lg: {
      marginRight: 'auto',
    },
  },
});

const Right = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(0px, 1fr))',
    gap: 'inherit',
    width: '100%',
    md: {},
    lg: {
      marginLeft: 'auto',
      display: 'flex',
      flexDirection: 'inherit',
      gap: 'inherit',
      width: 'auto',
    },
  },
});
