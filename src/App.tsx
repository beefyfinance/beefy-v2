import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { ScrollToTop } from './components/ScrollToTop';
import { theme } from './theme';
import { initHomeDataV4 } from './features/data/actions/scenarios';
import { store } from './store';
import { featureFlag_replayReduxActions } from './features/data/utils/feature-flags';
import { replayReduxActions } from './features/data/middlewares/debug/debug-replay';
import { CowLoader } from './components/CowLoader';
const Home = React.lazy(() => import(`./features/home`));
const Vault = React.lazy(() => import(`./features/vault`));
const BeefyAvatars = React.lazy(() => import(`./features/beefyAvatars`));

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
      <Router>
        <ScrollToTop />
        <Header />

        <React.Suspense fallback={<CowLoader text="Loading" />}>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route strict sensitive exact path="/:network/vault/:id">
              <Vault />
            </Route>
            <Route exact path="/nfts">
              <BeefyAvatars />
            </Route>
            <Route>
              <PageNotFound />
            </Route>
          </Switch>
        </React.Suspense>
      </Router>
    </ThemeProvider>
  );
};
