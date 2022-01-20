import React, { memo, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  AppBar,
  Toolbar,
  IconButton,
  Hidden,
  Drawer,
  Box,
  Container,
  Typography,
  Divider,
} from '@material-ui/core';
import { Menu, Close } from '@material-ui/icons';
import { styles } from './styles';
import { WalletContainer } from './components/WalletContainer';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { switchNetwork } from '../../helpers/switchNetwork';
import { getAvailableNetworks } from '../../helpers/utils';
import { formatUsd } from '../../helpers/format';
import { LanguageDropdown } from '../LanguageDropdown/LanguageDropdown';
import { SimpleDropdown } from '../SimpleDropdown/SimpleDropdown';
import { UnsupportedNetwork } from '../UnsupportedNetwork';
import { reduxActions } from '../../features/redux/actions';

const useStyles = makeStyles(styles as any);
export const Header = ({ isNightMode, setNightMode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const walletReducer = useSelector((state: any) => state.walletReducer);
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinks = [
    { title: t('Header-Vote'), path: 'https://vote.beefy.finance/' },
    { title: t('Header-Stats'), path: 'https://dashboard.beefy.finance/' },
    { title: t('Header-Blog'), path: 'https://blog.beefy.finance/articles/' },
    { title: t('Header-Docs'), path: 'https://docs.beefy.finance' },
  ];

  const updateNetwork = e => {
    e.preventDefault();
    dispatch(reduxActions.wallet.setNetwork(e.target.value));
  };

  const NavLinks = () => {
    return (
      <>
        <NavLink
          activeClassName={classes.active}
          className={classes.navLink}
          key={'explore'}
          to="/"
        >
          {t('Header-Explore')}
        </NavLink>
        {navLinks.map(({ title, path }) => (
          <Typography key={title} variant="body1" className={classes.navLink}>
            <a target="_blank" rel="noreferrer" href={path} key={title}>
              {title}
            </a>
          </Typography>
        ))}
      </>
    );
  };

  const BifiPrice = memo(function HeaderBifiPrice() {
    const pricesReducer = useSelector((state: any) => state.pricesReducer.prices);
    const classes = useStyles();

    const price = new BigNumber(pricesReducer['BIFI']);

    return (
      <a
        className={classes.bifiPrice}
        style={{ textDecoration: 'none' }}
        href="https://app.1inch.io/#/56/swap/BNB/BIFI"
        target="_blank"
        rel="noreferrer"
      >
        <img alt="BIFI" src={require(`../../images/BIFI-TOKEN.svg`).default} />
        <Typography variant="body1" noWrap={true}>
          {formatUsd(price.toNumber())}
        </Typography>
      </a>
    );
  });

  const appBarStyle = clsx([classes.navHeader, classes.hasPortfolio]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar className={appBarStyle} position="static">
        {walletReducer.error.status && walletReducer.error.message === 'UNSUPPORTED NETWORK' && (
          <UnsupportedNetwork />
        )}
        <Container maxWidth="lg">
          <Toolbar disableGutters={true}>
            <Box sx={{ flexGrow: 1 }}>
              <Link className={classes.beefy} to="/">
                <img alt="BIFI" src={require(`../../images/header-logo.svg`).default} />
              </Link>
            </Box>
            <Hidden mdDown>
              <Box className={classes.flex} sx={{ flexGrow: 1 }}>
                <NavLinks />
              </Box>
            </Hidden>
            <Box className={classes.flex}>
              <Hidden mdDown>
                <BifiPrice />
                <Box>
                  <LanguageDropdown />
                </Box>
                <Box>
                  <SimpleDropdown
                    noBorder={true}
                    chainLogos={true}
                    list={getAvailableNetworks(true)}
                    selected={walletReducer.network}
                    handler={e => switchNetwork(e.target.value, dispatch)}
                  />
                </Box>
              </Hidden>
              <WalletContainer />
            </Box>
            <Hidden lgUp>
              <Box ml={2}>
                <IconButton edge="start" aria-label="menu" onClick={handleDrawerToggle}>
                  <Menu fontSize="large" />
                </IconButton>
              </Box>
              <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                <Box className={classes.drawerBlack}>
                  <Box display="flex" alignContent="center" justifyContent="flex-end" mx={2} my={1}>
                    <IconButton onClick={handleDrawerToggle}>
                      <Close />
                    </IconButton>
                  </Box>
                </Box>
                <Divider />
                <Box
                  className={classes.mobileMenu}
                  role="presentation"
                  onClick={handleDrawerToggle}
                  onKeyDown={handleDrawerToggle}
                  flexGrow={1}
                >
                  <Box mt={2} className={classes.navMobile}>
                    <NavLinks />
                  </Box>
                </Box>
                <Divider />
                <Box className={classes.drawerBlack}>
                  <Box mx={2} my={2}>
                    <BifiPrice />
                  </Box>
                  <Box my={1} display="flex">
                    <SimpleDropdown
                      noBorder={true}
                      chainLogos={true}
                      list={getAvailableNetworks(true)}
                      selected={walletReducer.network}
                      handler={updateNetwork}
                    />
                    <LanguageDropdown />
                  </Box>
                </Box>
              </Drawer>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};
