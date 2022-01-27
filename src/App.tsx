import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { reduxActions } from './features/redux/actions';
import { ScrollToTop } from './components/ScrollToTop';
import { HideBalanceProvider } from './components/HideBalancesContext';
import { theme } from './theme';
import { initHomeDataV4 } from './features/data/actions/scenarios';
const Home = React.lazy(() => import(`./features/home`));
const Vault = React.lazy(() => import(`./features/vault`));
const Boost = React.lazy(() => import(`./features/boost`));
const PageNotFound = React.lazy(() => import(`./features/pagenotfound`));

export const App = () => {
  const dispatch = useDispatch();
  // const storage = localStorage.getItem('nightMode');
  //const [isNightMode, setNightMode] = React.useState(storage === null ? false : JSON.parse(storage));
  const [isNightMode, setNightMode] = React.useState(true);

  const { wallet } = useSelector((state: any) => ({
    wallet: state.walletReducer,
  }));
  /*
  React.useEffect(() => {
    const updateBalances = async () => {
      await dispatch(reduxActions.balance.fetchBalances());
      await dispatch(reduxActions.balance.fetchBoostBalances());
    };

    if (wallet.address) {
      updateBalances();
    }
  }, [dispatch, wallet]);

  React.useEffect(() => {
    const initiate = async () => {
      let now = Date.now();

      await dispatch(reduxActions.prices.fetchPrices());
      let promises = [
        dispatch(reduxActions.vault.fetchPools()),
        dispatch(reduxActions.vault.fetchBoosts()),
      ];
      await Promise.all(promises);

      await dispatch(reduxActions.vault.linkVaultBoosts());

      await dispatch(reduxActions.balance.fetchBalances());
      await dispatch(reduxActions.balance.fetchBoostBalances());

      setInterval(async () => {
        await dispatch(reduxActions.balance.fetchBalances());
        await dispatch(reduxActions.balance.fetchBoostBalances());
      }, 60000);

      let end = Date.now();
      console.log(`Load time is ${(end - now) / 1000}s`);
    };
    initiate();
  }, [dispatch]);

  React.useEffect(() => {
    localStorage.setItem('nightMode', JSON.stringify(isNightMode));
  }, [isNightMode]);

  React.useEffect(() => {
    if (!wallet.web3modal) {
      dispatch(reduxActions.wallet.createWeb3Modal());
    }
  }, [dispatch, wallet.web3modal]);
*/
  React.useEffect(() => {
    initHomeDataV4();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <HideBalanceProvider>
          <ScrollToTop />
          <Header isNightMode={isNightMode} setNightMode={() => setNightMode(!isNightMode)} />
          <React.Suspense fallback={<div className="loader" />}>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route strict sensitive exact path="/:network/vault/:id">
                <Vault />
              </Route>
              <Route strict sensitive exact path="/:network/boosts/:id">
                <Boost />
              </Route>
              <Route>
                <PageNotFound />
              </Route>
            </Switch>
          </React.Suspense>
        </HideBalanceProvider>
      </Router>
    </ThemeProvider>
  );
};
