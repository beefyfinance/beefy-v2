import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Hidden,
  makeStyles,
  Toolbar,
  useMediaQuery,
} from '@material-ui/core';
import clsx from 'clsx';
import { LanguageDropdown } from '../LanguageDropdown';
import { styles } from './styles';
import { NavItem } from './components/NavItem';
import { ReactComponent as VaultsIcon } from '../../images/icons/navigation/vault.svg';
import { ReactComponent as DashboardIcon } from '../../images/icons/navigation/dashboard.svg';
import { ReactComponent as BridgeIcon } from '../../images/icons/navigation/bridge.svg';
import { ReactComponent as BuyCryptoIcon } from '../../images/icons/navigation/buy-crypto.svg';
import { ReactComponent as DaoIcon } from '../../images/icons/navigation/dao.svg';
import { ReactComponent as ResourcesIcon } from '../../images/icons/navigation/resources.svg';
import { DaoNavItems, ResourcesNavItems } from './list';
import { ConnectionStatus } from './components/ConnectionStatus';
import { DropNavItem } from './components/DropNavItem';
import { MobileMenu } from './components/MobileMenu';
import { BifiPrice } from './components/BifiPrice';

const useStyles = makeStyles(styles);

export const Header = memo(function () {
  const location = useLocation();
  const isOnDashboard =
    location.pathname.includes('dashboard') || location.pathname.includes('treasury');
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width: 500px)');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        className={clsx([classes.navHeader, classes.hasPortfolio], {
          [classes.userOnDashboard]: isOnDashboard,
        })}
        position="static"
      >
        <Container className={classes.container} maxWidth="lg">
          <Toolbar className={classes.content} disableGutters={true}>
            <div className={classes.flex}>
              <Link className={classes.beefy} to="/">
                <img
                  alt="BIFI"
                  src={
                    isMobile
                      ? require(`../../images/bifi-logos/header-logo-notext.svg`).default
                      : require(`../../images/bifi-logos/header-logo.svg`).default
                  }
                />
              </Link>
              <Hidden mdDown>
                <NavItem title={'Header-Vaults'} url="/" Icon={VaultsIcon} />
                <NavItem title={'Header-Dashboard'} url="/dashboard" Icon={DashboardIcon} />
                <DropNavItem title={'Header-Dao'} Icon={DaoIcon} items={DaoNavItems} />
                <DropNavItem
                  title={'Header-Resources'}
                  Icon={ResourcesIcon}
                  items={ResourcesNavItems}
                />
              </Hidden>
            </div>
            <div className={classes.flex}>
              <Hidden mdDown>
                <NavItem title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
                <NavItem title={'Header-BridgeBifi'} url="/bridge" Icon={BridgeIcon} />
                <BifiPrice />
                <LanguageDropdown />
              </Hidden>
              <ConnectionStatus />
              <Hidden lgUp>
                <MobileMenu />
              </Hidden>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
});
