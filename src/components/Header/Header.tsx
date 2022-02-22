import React, { Suspense, useCallback, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
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
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { BIG_ZERO, formatBigUsd } from '../../helpers/format';
import { LanguageDropdown } from '../LanguageDropdown/LanguageDropdown';
import { SimpleDropdown } from '../SimpleDropdown/SimpleDropdown';
import { UnsupportedNetwork } from '../UnsupportedNetwork';
import { Transak } from '../Transak';
import { BeefyState } from '../../redux-types';
import {
  selectCurrentChainId,
  selectIsNetworkSupported,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { ChainEntity } from '../../features/data/entities/chain';
import { selectAllChains } from '../../features/data/selectors/chains';
import { askForNetworkChange } from '../../features/data/actions/wallet';
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

function renderChainListValue(value: string) {
  return (
    <>
      <img alt={value} src={require(`../../images/networks/${value}.svg`).default} />{' '}
      {value.toLocaleUpperCase()}
    </>
  );
}

export const Header = connect((state: BeefyState) => {
  const isNetworkSupported = selectIsNetworkSupported(state);
  const currentChainId = selectCurrentChainId(state);
  const chains = selectAllChains(state);
  const isWalletConnected = selectIsWalletConnected(state);
  return { isWalletConnected, isNetworkSupported, currentChainId, chains };
})(
  ({
    isWalletConnected,
    isNetworkSupported,
    currentChainId,
    chains,
  }: {
    isWalletConnected: boolean;
    isNetworkSupported: boolean;
    currentChainId: ChainEntity['id'] | null;
    chains: ChainEntity[];
  }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const { t } = useTranslation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };

    const updateNetwork = useCallback(
      chainId => dispatch(askForNetworkChange({ chainId })),
      [dispatch]
    );

    const chainValues = chains.reduce((agg, chain) => {
      agg[chain.id] = chain.name;
      return agg;
    }, {});

    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar className={clsx([classes.navHeader, classes.hasPortfolio])} position="static">
          {!isNetworkSupported && <UnsupportedNetwork />}
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
                  {isWalletConnected && (
                    <Box>
                      <SimpleDropdown
                        noBorder={true}
                        list={chainValues}
                        selected={currentChainId || 'bsc'}
                        renderValue={renderChainListValue}
                        handler={updateNetwork}
                        label={t('Chain')}
                      />
                    </Box>
                  )}
                </Hidden>
                <Suspense fallback={<>...</>}>
                  <WalletContainer />
                </Suspense>
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
                    <Box my={1} display="flex">
                      {isWalletConnected && (
                        <SimpleDropdown
                          noBorder={true}
                          renderValue={renderChainListValue}
                          list={chainValues}
                          selected={currentChainId || 'bsc'}
                          handler={updateNetwork}
                          label={t('Chain')}
                        />
                      )}
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
