import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { ScrollToTop } from './components/ScrollToTop';
import { theme } from './theme';
const Home = React.lazy(() => import(`./features/home`));
const Vault = React.lazy(() => import(`./features/vault`));
const Boost = React.lazy(() => import(`./features/boost`));
const PageNotFound = React.lazy(() => import(`./features/pagenotfound`));

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Header />
        <RouterContentWithData />
      </Router>
    </ThemeProvider>
  );
};

function RouterContentWithData() {
  return (
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
  );
}
