import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { ScrollToTop } from './components/ScrollToTop';
import { theme } from './theme';
import { initHomeDataV4 } from './features/data/actions/scenarios';
import { store } from './store';
import { FullscreenTechLoader, TechLoader } from './components/TechLoader';
import { Router } from './components/Router';
import { DefaultMeta } from './components/Meta';
import { HelmetProvider } from 'react-helmet-async';
import { Redirects } from './components/Redirects';
import { Stepper } from './components/Stepper';
import { Layout } from './components/Layout';

const Home = lazy(() => import(`./features/home`));
const Vault = lazy(() => import(`./features/vault`));
const OnRamp = lazy(() => import(`./features/on-ramp`));
const Bridge = lazy(() => import(`./features/bridge`));
const Dashboard = lazy(() => import(`./features/dashboard`));
const Treasury = lazy(() => import(`./features/treasury`));
const PageNotFound = lazy(() => import(`./features/pagenotfound`));

export const App = () => {
  useEffect(() => {
    initHomeDataV4(store);
  }, []);

  return (
    <Suspense fallback={<FullscreenTechLoader />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HelmetProvider>
          <Router>
            <ScrollToTop />
            <DefaultMeta />
            <Redirects />
            <Layout header={<Header />} footer={<Footer />}>
              <Suspense fallback={<TechLoader />}>
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
              </Suspense>
              <Stepper />
            </Layout>
          </Router>
        </HelmetProvider>
      </ThemeProvider>
    </Suspense>
  );
};
