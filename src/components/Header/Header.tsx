import React, { memo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  makeStyles,
  Toolbar,
  useMediaQuery,
} from '@material-ui/core';
import { Close, Menu } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { LanguageDropdown } from '../LanguageDropdown';
import { styles } from './styles';
import { BIG_ZERO } from '../../helpers/big-number';
import { NavItem } from './components/NavItem';
import { ReactComponent as VaultsIcon } from '../../images/icons/navigation/vault.svg';
import { ReactComponent as DashboardIcon } from '../../images/icons/navigation/dashboard.svg';
import { ReactComponent as BridgeIcon } from '../../images/icons/navigation/bridge.svg';
import { ReactComponent as BuyCryptoIcon } from '../../images/icons/navigation/buy-crypto.svg';
import { ReactComponent as DaoIcon } from '../../images/icons/navigation/dao.svg';
import { ReactComponent as ResourcesIcon } from '../../images/icons/navigation/resources.svg';

import { ConnectionStatus } from './components/ConnectionStatus';
import { DropNavItem } from './components/DropNavItem';

const useStyles = makeStyles(styles);

const BifiPrice = connect((state: BeefyState) => {
  const beefyPrice = state.entities.tokens.prices.byOracleId['BIFI'] || BIG_ZERO;
  return { beefyPrice };
})(({ beefyPrice }: { beefyPrice: BigNumber }) => {
  const classes = useStyles();
  return (
    <a
      className={classes.bifiPrice}
      href="https://app.1inch.io/#/56/swap/BNB/BIFI"
      target="_blank"
      rel="noreferrer"
    >
      <img alt="BIFI" src={require(`../../images/bifi-logos/BIFI-TOKEN.svg`).default} />
      {formatBigUsd(beefyPrice)}
    </a>
  );
});
// const navLinks = [
//   { title: t('Header-Vaults'), url: '/' },
//   { title: t('Header-Proposals'), url: 'https://vote.beefy.finance' },
//   { title: t('Header-BuyCrypto'), url: '/onramp' },
//   { title: t('Header-BridgeBifi'), url: '/bridge' },
//   { title: t('Header-News'), url: 'https://beefy.com/articles/' },
//   { title: t('Header-Docs'), url: 'https://docs.beefy.finance' },
// ];

export const Header = memo(function () {
  const location = useLocation();
  const isOnDashboard = location.pathname.includes('dashboard');
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width: 500px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
                <DropNavItem title={'Header-Dao'} Icon={DaoIcon} />
                <DropNavItem title={'Header-Resources'} Icon={ResourcesIcon} />
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
                <button
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                  className={classes.toggleDrawer}
                >
                  <Menu fontSize="inherit" className={classes.toggleDrawerIcon} />
                </button>
              </Hidden>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
});
