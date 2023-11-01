import React, { Fragment, memo, useState } from 'react';
import { Divider, Drawer, makeStyles } from '@material-ui/core';
import { Close, Menu } from '@material-ui/icons';
import { styles } from './styles';
// import { BifiPrice } from '../BifiPrice';
import { NavItemMobile } from '../NavItem';
import { useTranslation } from 'react-i18next';
import { MobileList } from '../../list';
import type { NavConfig, NavDropdownConfig } from '../DropNavItem/types';
import { isNavDropdownConfig } from '../DropNavItem/types';
import clsx from 'clsx';
import { UnreadProposalsDot } from '../Badges/UnreadProposalsDot';
import { Prices } from '../Prices';

const useStyles = makeStyles(styles);

export const MobileMenu = memo(function MobileMenu() {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <div>
      <button aria-label="menu" onClick={handleDrawerToggle} className={classes.toggleDrawer}>
        <Menu fontSize="inherit" className={classes.toggleDrawerIcon} />
        <UnreadProposalsDot className={classes.toggleDrawNotification} />
      </button>
      <Drawer className={classes.bg} anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        <div className={classes.menuContainer}>
          <div className={classes.head}>
            <div className={classes.flex}>
              <Prices />
            </div>
            <Close className={classes.cross} onClick={handleDrawerToggle} />
          </div>
          <Divider className={classes.divider} />
          {MobileList.map(item => {
            return (
              <Fragment key={item.title}>
                <MobileItem item={item} onClick={handleDrawerToggle} />
                <Divider className={classes.divider} />
              </Fragment>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
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

  const NavComponent = item.MobileComponent ?? NavItemMobile;
  return (
    <NavComponent
      onClick={onClick}
      title={item.title}
      url={item.url}
      Badge={item.Badge}
      Icon={item.Icon}
      exact={item.exact}
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
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.itemsContainer}>
      <div className={classes.itemTitle}>
        <Icon />
        <div className={clsx(classes.title, { [classes.titleWithBadge]: !!Badge })}>
          {t(title)}
          {Badge ? <Badge /> : null}
        </div>
      </div>
      <div>
        {items.map(item => {
          const NavComponent = item.MobileComponent ?? NavItemMobile;
          return (
            <NavComponent
              key={item.title}
              onClick={onClick}
              className={classes.customPadding}
              title={item.title}
              url={item.url}
              Icon={item.Icon}
              Badge={item.Badge}
            />
          );
        })}
      </div>
    </div>
  );
});
