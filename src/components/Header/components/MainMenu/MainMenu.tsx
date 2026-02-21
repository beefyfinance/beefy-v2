import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import { DropNavItem } from '../DropNavItem/DropNavItem.tsx';
import { DaoNavItems, ResourcesNavItems } from '../../list.ts';
import { UnreadArticleDot, UnreadProposalDot } from '../Badges/UnreadDots.tsx';
import { memo, useCallback } from 'react';
import VaultsIcon from '../../../../images/icons/navigation/vault.svg?react';
import DashboardIcon from '../../../../images/icons/navigation/dashboard.svg?react';
import DaoIcon from '../../../../images/icons/navigation/dao.svg?react';
import ResourcesIcon from '../../../../images/icons/navigation/resources.svg?react';
import { styled } from '@repo/styles/jsx';
import MenuButton from '../../../../images/icons/navigation/3dots.svg?react';
import { useLocation } from 'react-router';

export const MainMenu = memo(function MainMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const handleDrawerToggle = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const isOnHomePage = location.pathname === '/';

  return (
    <Container>
      <VaultsAndMenuContainer isOnHomePage={isOnHomePage}>
        <NavLinkItem title={'Header-Vaults'} url="/" Icon={VaultsIcon} />
      </VaultsAndMenuContainer>
      <DashboardContainer>
        <NavLinkItem end={false} title={'Header-Dashboard'} url="/dashboard" Icon={DashboardIcon} />
      </DashboardContainer>
      <DaoResourcesContainer>
        <DaoContainer>
          <DropNavItem
            title={'Header-Dao'}
            Icon={DaoIcon}
            items={DaoNavItems}
            Badge={UnreadProposalDot}
          />
        </DaoContainer>
        <ResourcesContainer>
          <DropNavItem
            title={'Header-Resources'}
            Icon={ResourcesIcon}
            items={ResourcesNavItems}
            Badge={UnreadArticleDot}
          />
        </ResourcesContainer>
      </DaoResourcesContainer>
      <VaultsAndMenuContainer isOnHomePage={isOnHomePage}>
        <MenuButtonContainer>
          <MenuButton onClick={handleDrawerToggle} />
        </MenuButtonContainer>
      </VaultsAndMenuContainer>
    </Container>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '24px',
    '@media (max-width: 1002px)': {
      columnGap: '12px',
    },
  },
});

const DaoResourcesContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '20px',
    '@media (max-width: 1002px)': {
      columnGap: '8px',
    },
    '@media (max-width: 920px)': {
      display: 'none',
    },
  },
});

const VaultsAndMenuContainer = styled('div', {
  base: {
    '@media (max-width: 712px)': {
      display: 'none',
    },
  },
  variants: {
    isOnHomePage: {
      true: {
        '@media (max-width: 712px)': {
          display: 'none',
        },
      },
    },
  },
});

const DashboardContainer = styled('div', {
  base: {
    '@media (max-width: 850px)': {
      display: 'none',
    },
  },
});

const DaoContainer = styled('div', {
  base: {
    '@media (max-width: 940px)': {
      display: 'none',
    },
  },
});

const ResourcesContainer = styled('div', {
  base: {
    '@media (max-width: 1040px)': {
      display: 'none',
    },
  },
});

const MenuButtonContainer = styled('div', {
  base: {
    height: '40px',
    width: '40px',
    padding: '12px 20px 12px 4px',
    color: 'text.dark',
    _hover: {
      cursor: 'pointer',
      color: 'text.light',
    },
    '@media (min-width: 1040px)': {
      display: 'none',
    },
  },
});
