import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import reduxActions from 'features/redux/actions';
import {
  makeStyles,
  AppBar,
  Toolbar,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Hidden,
  Drawer,
  Box,
  Button,
  Grid,
} from '@material-ui/core';
import { Menu, WbSunny, NightsStay } from '@material-ui/icons';
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

  const NavLinks = () => {
    const navLinks = [
      { title: t('Header-Home'), path: 'https://beefy.finance' },
      { title: t('Header-Explore'), path: '/' },
      { title: t('Header-Docs'), path: 'https://docs.beefy.finance' },
    ];

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
    <AppBar
      className={[classes.navHeader, location.pathname === '/' ? classes.hasPortfolio : ''].join(
        ' '
      )}
      position="static"
    >
      {walletReducer.error.status && walletReducer.error.message === 'UNSUPPORTED NETWORK' && (
        <UnsupportedNetwork />
      )}
      <Toolbar disableGutters={true}>
        <Container maxWidth="lg" className={classes.navDisplayFlex}>
          <Box className={classes.beefy}>
            <img alt="BIFI" src={require('images/BIFI.svg').default} />
            <Button
              onClick={() => {
                history.push('/');
              }}
            >
              Beefy.Finance
            </Button>
          </Box>
          <Hidden smDown>
            <List
              component="nav"
              aria-labelledby="main navigation"
              className={classes.navDisplayFlex}
            >
              <NavLinks />
              <IconButton onClick={setNightMode} className={classes.hide}>
                {isNightMode ? <WbSunny /> : <NightsStay />}
              </IconButton>
              <Box sx={{ marginRight: 10 }}>
                <LanguageDropdown />
              </Box>
              <Box sx={{ marginRight: 10 }}>
                <SimpleDropdown
                  list={getAvailableNetworks(true)}
                  selected={walletReducer.network}
                  handler={e => switchNetwork(e.target.value, dispatch)}
                />
              </Box>
              <Box>
                <WalletContainer />
              </Box>
            </List>
          </Hidden>
          <Hidden mdUp>
            <IconButton edge="start" aria-label="menu" onClick={handleDrawerToggle}>
              <Menu fontSize="large" />
            </IconButton>
            <Drawer
              anchor="right"
              sx={{ paddingTop: '1rem' }}
              open={mobileOpen}
              onClose={handleDrawerToggle}
            >
              <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }} my={1}>
                <WalletContainer />
              </Box>
              <Grid container alignItems="center" spacing={1}>
                <Grid item xs={12}>
                  <LanguageDropdown />
                </Grid>
                <Grid item xs={12}>
                  <SimpleDropdown
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
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
