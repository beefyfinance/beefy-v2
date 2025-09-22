import { memo, useCallback, useState } from 'react';
import MenuIcon from '../../../../images/icons/Menu.svg?react';
import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import { MobileList } from '../../list.ts';
import type { NavConfig, NavDropdownConfig } from '../DropNavItem/types.ts';
import { isNavDropdownConfig } from '../DropNavItem/types.ts';
import { BifiPricesMobile, BridgeNavButton } from '../Prices/Prices.tsx';
import { UnreadDots } from '../Badges/UnreadDots.tsx';
import { styled } from '@repo/styles/jsx';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { NavItem } from '../NavItem/NavLink.tsx';
import { ScrollableDrawer } from '../../../ScrollableDrawer/ScrollableDrawer.tsx';
import { Button } from '../../../Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import ForwardArrowIcon from '../../../../images/icons/forward-arrow.svg?react';

export const MobileMenu = memo(function MobileMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(open => !open);
  }, [setMobileOpen]);

  return (
    <>
      <MenuButton aria-label="menu" onClick={handleDrawerToggle}>
        <MenuIcon fontSize="inherit" style={{ height: '28px', width: '28px' }} />
        <UnreadDots />
      </MenuButton>
      <ScrollableDrawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        mainChildren={
          <Container>
            <NavItemContainer prices={true}>
              <BifiPricesMobile />
              <BridgeNavButton onClick={handleDrawerToggle} to="bridge">
                <span>{t('Bridge')}</span>
                <FowardArrowContainer>
                  <ForwardArrowIcon />
                </FowardArrowContainer>
              </BridgeNavButton>
            </NavItemContainer>
            {MobileList.map(item => {
              return <MobileItem key={item.title} item={item} onClick={handleDrawerToggle} />;
            })}
          </Container>
        }
        footerChildren={
          <Button fullWidth={true} borderless={true} onClick={handleDrawerToggle}>
            {t('RpcModal-Close')}
          </Button>
        }
      />
    </>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px 12px',
  },
});

const MenuButton = styled('button', {
  base: {
    background: 'transparent',
    padding: '0',
    border: 0,
    boxShadow: 'none',
    color: 'text.dark',
    fontSize: '30px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40px',
    width: '40px',
  },
});

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
    <NavItemContainer>
      <NavComponent
        onClick={onClick}
        title={item.title}
        url={item.url}
        Badge={item.Badge}
        Icon={item.Icon}
        end={item.end}
        mobile={true}
      />
    </NavItemContainer>
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
    <NavItemContainer sublist={items.length > 0}>
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
              externalLink={item.externalLink}
            />
          );
        })}
      </SubItems>
    </NavItemContainer>
  );
});

const NavItemContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    paddingBlock: '4px',
  },
  variants: {
    sublist: {
      true: {
        paddingBlock: '6px',
      },
    },
    prices: {
      true: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: '12px 4px',
        paddingBlock: '4px',
      },
    },
  },
});

const SubItems = styled('div', {
  base: {
    paddingLeft: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
});

const FowardArrowContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    '& > svg': {
      color: 'inherit',
      height: '12px',
    },
  },
});
