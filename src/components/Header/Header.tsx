import React, { Suspense, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { LanguageDropdown } from '../LanguageDropdown';
import { ChainEntity } from '../../features/data/entities/chain';
import { NetworkStatus } from '../NetworkStatus';
import { Transak } from '../Transak';
import { styles } from './styles';
import { BIG_ZERO } from '../../helpers/big-number';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = React.lazy(() => import(`./components/WalletContainer`));

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
      <img alt="BIFI" src={require(`../../images/BIFI-TOKEN.svg`).default} />
      {formatBigUsd(beefyPrice)}
    </a>
  );
});

const NavLinks = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const navLinks = [
    { title: t('Header-Vote'), path: 'https://vote.beefy.finance' },
    { title: t('Header-Stats'), path: 'https://dashboard.beefy.com' },
    { title: t('Header-Blog'), path: 'https://beefy.com/articles/' },
    { title: t('Header-Docs'), path: 'https://docs.beefy.finance' },
  ];
  return (
    <>
      <NavLink
        activeClassName={classes.active}
        exact={true}
        className={classes.navLink}
        key={'explore'}
        to="/"
      >
        {t('Header-Explore')}
      </NavLink>
      {navLinks.map(({ title, path }) => (
        <div key={title} className={classes.navLink}>
          <a target="_blank" rel="noreferrer" href={path} key={title}>
            {title}
          </a>
        </div>
      ))}
      <Transak className={classes.navLink}>{t('Header-Buy')}</Transak>
    </>
  );
};

const ActiveChain = ({ networkId }: { networkId: string | null }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.chain} style={{ textDecoration: 'none' }}>
      {networkId === null ? null : (
        <img alt={networkId} src={require(`../../images/networks/${networkId}.svg`).default} />
      )}{' '}
      {networkId === null ? t('Network-Unsupported') : networkId.toLocaleUpperCase()}
    </div>
  );
};

export const Header = connect((state: BeefyState) => {
  const currentChainId = selectCurrentChainId(state);
  const isWalletConnected = selectIsWalletConnected(state);
  return { isWalletConnected, currentChainId };
})(
  ({
    isWalletConnected,
    currentChainId,
  }: {
    isWalletConnected: boolean;
    currentChainId: ChainEntity['id'] | null;
  }) => {
    const classes = useStyles();

    const isMobile = useMediaQuery('(max-width: 500px)');

    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar className={clsx([classes.navHeader, classes.hasPortfolio])} position="static">
          <Container className={classes.container} maxWidth="lg">
            <Toolbar disableGutters={true}>
              <Box sx={{ flexGrow: 1 }}>
                <Link className={classes.beefy} to="/">
                  <img
                    alt="BIFI"
                    src={
                      isMobile
                        ? require(`../../images/header-logo-notext.svg`).default
                        : require(`../../images/header-logo.svg`).default
                    }
                  />
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
                  {isWalletConnected && (
                    <Box mr={3}>
                      <ActiveChain networkId={currentChainId} />
                    </Box>
                  )}
                </Hidden>
                <NetworkStatus />
                <div className={classes.walletContainer}>
                  <Suspense fallback={<>...</>}>
                    <WalletContainer />
                  </Suspense>
                </div>
              </Box>
              <Hidden lgUp>
                <button
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                  className={classes.toggleDrawer}
                >
                  <Menu fontSize="inherit" className={classes.toggleDrawerIcon} />
                </button>
                <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                  <Box className={classes.drawerBlack}>
                    <Box
                      display="flex"
                      alignContent="center"
                      justifyContent="flex-end"
                      mx={2}
                      my={1}
                    >
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
                    <Box mx={2} my={1} display="flex">
                      {isWalletConnected && <ActiveChain networkId={currentChainId} />}
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
  }
);
