import { Fragment, memo, useCallback, useState } from 'react';
import CloseIcon from '../../../../images/icons/mui/Close.svg?react';
import MenuIcon from '../../../../images/icons/Menu.svg?react';
import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import { MobileList } from '../../list.ts';
import type { NavConfig, NavDropdownConfig } from '../DropNavItem/types.ts';
import { isNavDropdownConfig } from '../DropNavItem/types.ts';
import { Prices } from '../Prices/Prices.tsx';
import { UnreadDots } from '../Badges/UnreadDots.tsx';
import { Drawer } from '../../../Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { NavItem } from '../NavItem/NavLink.tsx';

export const MobileMenu = memo(function MobileMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(open => !open);
  }, [setMobileOpen]);

  return (
    <>
      <MenuButton aria-label="menu" onClick={handleDrawerToggle}>
        <MenuIcon fontSize="inherit" style={{ height: '32px', width: '32px' }} />
        <UnreadDots />
      </MenuButton>
      <Drawer scrollable={false} open={mobileOpen} onClose={handleDrawerToggle}>
        <Sidebar>
          <Header>
            <Prices />
            <CloseButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </CloseButton>
          </Header>
          <Divider />
          {MobileList.map(item => {
            return (
              <Fragment key={item.title}>
                <MobileItem item={item} onClick={handleDrawerToggle} />
                <Divider />
              </Fragment>
            );
          })}
        </Sidebar>
      </Drawer>
    </>
  );
});

const Divider = styled('hr', {
  base: {
    height: '2px',
    backgroundColor: 'background.content.dark',
    display: 'block',
    margin: 0,
    padding: 0,
    border: 'none',
  },
});

const MenuButton = styled('button', {
  base: {
    background: 'transparent',
    padding: '0',
    border: 0,
    boxShadow: 'none',
    color: 'text.light',
    fontSize: '30px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Sidebar = styled('div', {
  base: {
    backgroundColor: 'background.header',
    minHeight: '100vh',
    width: '320px',
    overflowY: 'auto',
  },
});

const Header = styled('div', {
  base: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

const CloseButton = styled(
  'button',
  {
    base: {
      marginLeft: 'auto',
      color: 'text.middle',
      _hover: {
        color: 'text.light',
      },
    },
  },
  { defaultProps: { type: 'button' } }
);

type MobileItemProps = {
  item: NavConfig;
  onClick: () => void;
};
const MobileItem = memo<MobileItemProps>(function MobileItem({ item, onClick }) {
  if (isNavDropdownConfig(item)) {
    const NavComponent = item.MobileComponent ?? DropMobile;
    return (
      <NavComponent
        onClick={onClick}
        title={item.title}
        Icon={item.Icon}
        Badge={item.Badge}
        items={item.items}
      />
    );
  }

  const NavComponent = item.MobileComponent ?? NavLinkItem;
  return (
    <NavComponent
      onClick={onClick}
      title={item.title}
      url={item.url}
      Badge={item.Badge}
      Icon={item.Icon}
      end={item.end}
      mobile={true}
    />
  );
});

type DropMobileProps = NavDropdownConfig;

export const DropMobile = memo<DropMobileProps>(function DropMobile({
  title,
  Icon,
  items,
  onClick,
  Badge,
}) {
  return (
    <>
      <NavItem mobile={true}>
        <NavItemInner title={title} Icon={Icon} Badge={Badge} />
      </NavItem>
      <SubItems>
        {items.map(item => {
          const NavComponent = item.MobileComponent ?? item.Component ?? NavLinkItem;
          return (
            <NavComponent
              key={item.title}
              onClick={onClick}
              title={item.title}
              url={item.url}
              Icon={item.Icon}
              Badge={item.Badge}
              mobile={true}
            />
          );
        })}
      </SubItems>
    </>
  );
});

const SubItems = styled('div', {
  base: {
    paddingLeft: '16px',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '-8px',
    paddingBottom: '8px',
  },
});
