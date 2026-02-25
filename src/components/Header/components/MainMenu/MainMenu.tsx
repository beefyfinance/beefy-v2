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
import MenuButtonIcon from '../../../../images/icons/navigation/3dots.svg?react';
import type { Nested, SystemProperties, SystemStyleObject } from '@repo/styles/types';

const visibleFrom = {
  vaults: 712,
  dashboard: 851,
  dao: 941,
  resources: 1041,
};

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
      <Item visibility="vaults">
        <NavLinkItem title={'Header-Vaults'} url="/" Icon={VaultsIcon} />
      </Item>
      <Item visibility="dashboard">
        <NavLinkItem end={false} title={'Header-Dashboard'} url="/dashboard" Icon={DashboardIcon} />
      </Item>
      <Item visibility="dao">
        <DropNavItem
          title={'Header-Dao'}
          Icon={DaoIcon}
          items={DaoNavItems}
          Badge={UnreadProposalDot}
        />
      </Item>
      <Item visibility="resources">
        <DropNavItem
          title={'Header-Resources'}
          Icon={ResourcesIcon}
          items={ResourcesNavItems}
          Badge={UnreadArticleDot}
        />
      </Item>
      <MenuButton>
        <MenuButtonIcon onClick={handleDrawerToggle} />
      </MenuButton>
    </Container>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '12px',
    '@media (min-width: 1003px)': {
      columnGap: '24px',
    },
  },
});

const menuButtonQuery = {
  [`@media (max-width: ${visibleFrom.vaults - 1}px)`]: {
    display: 'none',
  },
  [`@media (min-width: ${visibleFrom.resources}px)`]: {
    display: 'none',
  },
} as Nested<SystemStyleObject>;

const MenuButton = styled('button', {
  base: {
    height: '40px',
    width: '40px',
    padding: '12px 20px 12px 4px',
    color: 'text.dark',
    _hover: {
      cursor: 'pointer',
      color: 'text.light',
    },
    ...menuButtonQuery,
  },
});

const Item = styled('div', {
  base: {},
  variants: {
    visibility: getVisibilityVariants(),
  },
});

function getVisibilityVariants() {
  return Object.fromEntries(
    Object.entries(visibleFrom).map(([key, from]) => [
      key,
      {
        [`@media (max-width: ${from - 1}px)` as const]: {
          display: 'none' as const,
        } as SystemProperties,
      } as SystemStyleObject,
    ])
  ) as Record<keyof typeof visibleFrom, SystemStyleObject>;
}
