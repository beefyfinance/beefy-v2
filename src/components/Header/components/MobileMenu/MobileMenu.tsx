import React, { memo, useState } from 'react';
import { Divider, Drawer, makeStyles } from '@material-ui/core';
import { Close, Menu } from '@material-ui/icons';
import { styles } from './styles';
import { BifiPrice } from '../BifiPrice';
import { LanguageDropdown } from '../../../LanguageDropdown';
import { NavItemMobile } from '../NavItem';
import { ReactComponent as VaultsIcon } from '../../../../images/icons/navigation/vault.svg';
import { ReactComponent as DashboardIcon } from '../../../../images/icons/navigation/dashboard.svg';
import { ReactComponent as BridgeIcon } from '../../../../images/icons/navigation/bridge.svg';
import { ReactComponent as BuyCryptoIcon } from '../../../../images/icons/navigation/buy-crypto.svg';
import { ReactComponent as DaoIcon } from '../../../../images/icons/navigation/dao.svg';
import { ReactComponent as ResourcesIcon } from '../../../../images/icons/navigation/resources.svg';

import { useTranslation } from 'react-i18next';
import { DaoNavItems, ResourcesNavItems } from '../../Header';

const useStyles = makeStyles(styles);

export const MobileMenu = memo(function () {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <div>
      <button aria-label="menu" onClick={handleDrawerToggle} className={classes.toggleDrawer}>
        <Menu fontSize="inherit" className={classes.toggleDrawerIcon} />
      </button>
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        <div className={classes.menuContainer}>
          <div className={classes.head}>
            <div className={classes.flex}>
              <BifiPrice />
              <LanguageDropdown />
            </div>
            <Close className={classes.cross} onClick={handleDrawerToggle} />
          </div>
          <Divider className={classes.divider} />
          <NavItemMobile title={'Header-Vaults'} url="/" Icon={VaultsIcon} />
          <Divider className={classes.divider} />
          <NavItemMobile title={'Header-Dashboard'} url="/dashboard" Icon={DashboardIcon} />
          <Divider className={classes.divider} />
          <DropMobile title={'Header-Dao'} Icon={DaoIcon} items={DaoNavItems} />
          <DropMobile title={'Header-Resources'} Icon={ResourcesIcon} items={ResourcesNavItems} />
          <NavItemMobile title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
          <NavItemMobile title={'Header-BridgeBifi'} url="/bridge" Icon={BridgeIcon} />
        </div>
      </Drawer>
    </div>
  );
});

interface DropMobileProps {
  title: string;
  Icon: React.FC;
  items: { url: string; title: string; Icon: React.FC }[];
}

export const DropMobile = memo<DropMobileProps>(function ({ title, Icon, items }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.itemsContainer}>
        <div className={classes.itemTitle}>
          <Icon />
          {t(title)}
        </div>
        <div>
          {items.map(item => {
            return (
              <NavItemMobile
                className={classes.customPadding}
                title={item.title}
                url={item.url}
                Icon={item.Icon}
              />
            );
          })}
        </div>
      </div>
      <Divider className={classes.divider} />
    </>
  );
});
