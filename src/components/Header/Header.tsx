import React, { Suspense, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { Close, Menu } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  selectCurrentChainId,
  selectIsNetworkSupported,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { BIG_ZERO, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { LanguageDropdown } from '../LanguageDropdown';
import { ChainEntity } from '../../features/data/entities/chain';
import { NetworkStatus } from '../NetworkStatus';
import { Transak } from '../Transak';
import { UnsupportedNetwork } from '../UnsupportedNetwork';
import { styles } from './styles';
// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = React.lazy(() => import(`./components/WalletContainer`));

const useStyles = makeStyles(styles as any);

const BifiPrice = connect((state: BeefyState) => {
  const beefyPrice = state.entities.tokens.prices.byTokenId['BIFI'] || BIG_ZERO;
  return { beefyPrice };
})(({ beefyPrice }: { beefyPrice: BigNumber }) => {
  const classes = useStyles();
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
        {formatBigUsd(beefyPrice)}
      </Typography>
    </a>
  );
});

const NavLinks = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const navLinks = [
    { title: t('Header-Vote'), path: 'https://vote.beefy.finance/' },
    { title: t('Header-Stats'), path: 'https://dashboard.beefy.finance/' },
    { title: t('Header-Blog'), path: 'https://blog.beefy.finance/articles/' },
    { title: t('Header-Docs'), path: 'https://docs.beefy.finance' },
  ];
  return (
    <>
      <NavLink activeClassName={classes.active} className={classes.navLink} key={'explore'} to="/">
        {t('Header-Explore')}
      </NavLink>
      {/* <NavLink activeClassName={classes.active} className={classes.navLink} key={'nfts'} to="/nfts">
        {t('Header-Nfts')}
      </NavLink> */}
      {navLinks.map(({ title, path }) => (
        <Typography key={title} variant="body1" className={classes.navLink}>
          <a target="_blank" rel="noreferrer" href={path} key={title}>
            {title}
          </a>
        </Typography>
      ))}
      <Transak className={classes.navLink}>{t('Header-Buy')}</Transak>
    </>
  );
};

const ActiveChain = ({ value }: { value: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.chain} style={{ textDecoration: 'none' }}>
      <img alt={value} src={require(`../../images/networks/${value}.svg`).default} />{' '}
      <Typography variant="body1" noWrap={true}>
        {value.toLocaleUpperCase()}
      </Typography>
    </div>
  );
};

export const Header = connect((state: BeefyState) => {
  const isNetworkSupported = selectIsNetworkSupported(state);
  const currentChainId = selectCurrentChainId(state);
  const isWalletConnected = selectIsWalletConnected(state);
  return { isWalletConnected, isNetworkSupported, currentChainId };
})(
  ({
    isWalletConnected,
    isNetworkSupported,
    currentChainId,
  }: {
    isWalletConnected: boolean;
    isNetworkSupported: boolean;
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
          {!isNetworkSupported && <UnsupportedNetwork />}
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
                      <ActiveChain value={currentChainId || 'bsc'} />
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
                <Box ml={2}>
                  <IconButton edge="start" aria-label="menu" onClick={handleDrawerToggle}>
                    <Menu fontSize="large" />
                  </IconButton>
                </Box>
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
                      {isWalletConnected && <ActiveChain value={currentChainId || 'bsc'} />}
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
