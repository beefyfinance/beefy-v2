import { memo } from 'react';
import { ChainButtonFilter } from './components/ChainFilters/ChainButtonFilter.tsx';
import { UserCategoryButtonFilter } from './components/UserCategoryFilters/UserCategoryButtonFilter.tsx';
import { AssetTypeButtonFilter } from './components/AssetTypeFilters/AssetTypeButtonFilter.tsx';
import { ExtendedFiltersButtonDropdown } from './components/ExtendedFilters/ExtendedFiltersButtonDropdown.tsx';
import { ClearFiltersButton } from './components/ClearFiltersButton/ClearFiltersButton.tsx';
import { VaultCategoryButtonFilter } from './components/VaultCategoryFilters/VaultCategoryButtonFilter.tsx';
import { StrategyTypeButtonFilter } from './components/StrategyTypeFilters/StrategyTypeButtonFilter.tsx';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { styled } from '@repo/styles/jsx';
import { BoostFilterButton } from './components/BoostFilter/BoostFilterButton.tsx';
import { Sort } from './components/Sort/Sort.tsx';
import { ExtendedFiltersButtonMobileFilters } from './components/ExtendedFilters/ExtendedFiltersButtonMobileFilters.tsx';

export const Filters = memo(function Filters() {
  const isDesktop = useBreakpoint({ from: 'lg' });

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
});

const MobileLayout = memo(function MobileLayout() {
  return (
    <Layout>
      <MobileFilters>
        <Sort />
        <ExtendedFiltersButtonMobileFilters />
      </MobileFilters>
      <Top>
        <UserCategoryButtonFilter />
      </Top>
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
        <UserCategoryButtonFilter />
        <BoostFilterButton />
        <VaultCategoryButtonFilter />
        <AssetTypeButtonFilter />
        <StrategyTypeButtonFilter />
        <ExtendedFiltersButtonDropdown />
        <ClearFiltersButton />
      </Bottom>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
});

const Top = styled('div', {
  base: {
    height: '40px',
    width: '100%',
  },
});

const MobileFilters = styled(Top, {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& > :first-child': {
      width: '50%',
    },
    '& > :last-child': {
      width: '50%',
    },
  },
});

const Bottom = styled('div', {
  base: {
    height: '40px',
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
      flexDirection: 'inherit',
      gap: 'inherit',
      width: '100%',
    },
  },
});
