import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { WrappedFooter } from './components/Footer';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { ScrollToTop } from './components/ScrollToTop';
import { theme } from './theme';
import { initHomeDataV4 } from './features/data/actions/scenarios';
import { store } from './store';
import { featureFlag_replayReduxActions } from './features/data/utils/feature-flags';
import { replayReduxActions } from './features/data/middlewares/debug/debug-replay';
import { CowLoader } from './components/CowLoader';
import { Router } from './components/Router';
import { DefaultMeta } from './components/Meta';
import { HelmetProvider } from 'react-helmet-async';
import { Redirects } from './components/Redirects';
import { Stepper } from './components/Stepper';

const Home = React.lazy(() => import(`./features/home`));
const Vault = React.lazy(() => import(`./features/vault`));
const OnRamp = React.lazy(() => import(`./features/on-ramp`));
const Bridge = React.lazy(() => import(`./features/bridge`));
const Dashboard = React.lazy(() => import(`./features/dashboard`));
const Treasury = React.lazy(() => import(`./features/treasury`));
const PageNotFound = React.lazy(() => import(`./features/pagenotfound`));

export const App = () => {
  React.useEffect(() => {
    // load our data
    if (featureFlag_replayReduxActions()) {
      console.log(
        'Please run __replay_action_log(actions)',
        replayReduxActions /* add it here to make webpack add it to the build */
      );
    } else {
      initHomeDataV4(store);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <DefaultMeta />
          <Redirects />
          <WrappedFooter>
            <Header />
            <React.Suspense fallback={<CowLoader text="Loading" />}>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route strict sensitive exact path={['/:network/vault/:id', '/vault/:id']}>
                  <Vault />
                </Route>
                <Route exact path="/onramp">
                  <OnRamp />
                </Route>
                <Route exact path="/bridge">
                  <Bridge />
                </Route>
                <Route exact path="/dashboard">
                  <Dashboard />
                </Route>
                <Route exact path="/treasury">
                  <Treasury />
                </Route>
                <Route>
                  <PageNotFound />
                </Route>
              </Switch>
              <Stepper />
            </React.Suspense>
          </WrappedFooter>
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  );
};
