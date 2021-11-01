import React, { memo, useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import reduxActions from '../../features/redux/actions';
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
import styles from './styles';
import WalletContainer from './components/WalletContainer';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import switchNetwork from '../../helpers/switchNetwork';
import { getAvailableNetworks } from '../../helpers/utils';
import LanguageDropdown from '../LanguageDropdown/LanguageDropdown';
import SimpleDropdown from '../SimpleDropdown/SimpleDropdown';
import UnsupportedNetwork from '../UnsupportedNetwork';

const useStyles = makeStyles(styles);

export const Header = ({ isNightMode, setNightMode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const walletReducer = useSelector(state => state.walletReducer);
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (!walletReducer.web3modal) {
      dispatch(reduxActions.wallet.createWeb3Modal());
    }
  }, [dispatch, walletReducer.web3modal]);

  const navLinks = [
    { title: t('Header-Vote'), path: 'https://vote.beefy.finance/' },
    { title: t('Header-Stats'), path: 'https://dashboard.beefy.finance/' },
    { title: t('Header-Docs'), path: 'https://docs.beefy.finance' },
  ];

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
          <a target="_blank" rel="noreferrer" className={classes.navLink} href={path} key={title}>
            {title}
          </a>
        ))}
      </>
    );
  };

  const BifiPrice = memo(function HeaderBifiPrice() {
    const pricesReducer = useSelector(state => state.pricesReducer);
    const classes = useStyles();

    const price = React.useMemo(() => {
      return BigNumber(pricesReducer.prices['BIFI']).toFixed(2);
    }, [pricesReducer]);

    return (
      <Box className={classes.bifiPrice}>
        <a
          className={classes.bifiPrice}
          style={{ textDecoration: 'none' }}
          href="https://app.1inch.io/#/56/swap/BNB/BIFI"
          target="_blank"
          rel="noreferrer"
        >
          <img alt="BIFI" src={require('images/BIFI-TOKEN.svg').default} />
          <Typography noWrap={true}>{`$${price ? price : '$0'}`}</Typography>
        </a>
      </Box>
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
                <img alt="BIFI" src={require('images/cow-outlined.svg').default} />
                <Hidden mdDown>
                  <Box>Beefy.Finance</Box>
                </Hidden>
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
                      handler={e => switchNetwork(e.target.value, dispatch)}
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