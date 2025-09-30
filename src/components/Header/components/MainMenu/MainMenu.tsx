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

export const MainMenu = memo(function MainMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const handleDrawerToggle = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <Container>
      <VaultsAndMenuContainer>
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
      <VaultsAndMenuContainer>
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
    columnGap: '20px',
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
    '@media (max-width: 919px)': {
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
});

const DashboardContainer = styled('div', {
  base: {
    '@media (max-width: 800px)': {
      display: 'none',
    },
  },
});

const DaoContainer = styled('div', {
  base: {
    '@media (max-width: 919px)': {
      display: 'none',
    },
  },
});

const ResourcesContainer = styled('div', {
  base: {
    '@media (max-width: 1001px)': {
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
    '@media (min-width: 1002px)': {
      display: 'none',
    },
  },
});
