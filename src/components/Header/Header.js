import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import reduxActions from 'features/redux/actions';
import {
  makeStyles,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Hidden,
  Drawer,
  Box,
  Grid,
  Container,
} from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import styles from './styles';
import { useLocation } from 'react-router';
import WalletContainer from './components/WalletContainer';
import SimpleDropdown from 'components/SimpleDropdown';
import LanguageDropdown from 'components/LanguageDropdown';
import { getAvailableNetworks } from 'helpers/utils';
import { useTranslation } from 'react-i18next';
import switchNetwork from 'helpers/switchNetwork';
import UnsupportedNetwork from 'components/UnsupportedNetwork';

const useStyles = makeStyles(styles);

const Header = ({ isNightMode, setNightMode }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
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
    { title: t('Header-Home'), path: 'https://beefy.finance' },
    { title: t('Header-Explore'), path: '/' },
    { title: t('Header-Docs'), path: 'https://docs.beefy.finance' },
  ];

  const NavLinks = () => {
    return (
      <>
        {navLinks.map(({ title, path }) => (
          <ListItem
            key={title}
            button
            onClick={() => {
              window.location.href = path;
            }}
            className={classes.navLink}
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        className={[classes.navHeader, location.pathname === '/' ? classes.hasPortfolio : ''].join(
          ' '
        )}
        position="static"
      >
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
                {navLinks.map(link => (
                  <Link className={classes.navLink} key={link.title} to={link.path}>
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Hidden>
            <Box className={classes.flex}>
              <Hidden mdDown>
                <Box ml={2}>
                  <LanguageDropdown />
                </Box>
                <Box mx={2}>
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
              <IconButton edge="start" aria-label="menu" onClick={handleDrawerToggle}>
                <Menu fontSize="large" />
              </IconButton>
              <Drawer
                anchor="right"
                sx={{ paddingTop: '1rem' }}
                open={mobileOpen}
                onClose={handleDrawerToggle}
              >
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={12}>
                    <LanguageDropdown />
                  </Grid>
                  <Grid item xs={12}>
                    <SimpleDropdown
                      noBorder={true}
                      chainLogos={true}
                      list={getAvailableNetworks(true)}
                      selected={walletReducer.network}
                      handler={e => switchNetwork(e.target.value, dispatch)}
                    />
                  </Grid>
                </Grid>
                <div
                  className={classes.mobileMenu}
                  role="presentation"
                  onClick={handleDrawerToggle}
                  onKeyDown={handleDrawerToggle}
                >
                  <List component="nav">
                    <NavLinks />
                  </List>
                </div>
              </Drawer>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};

export default Header;
