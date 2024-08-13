import { lazy, memo, type ReactNode, Suspense, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { ScrollToTop } from './components/ScrollToTop';
import { theme } from './theme';
import { initAppData } from './features/data/actions/scenarios';
import { store } from './store';
import { FullscreenTechLoader } from './components/TechLoader';
import { Router } from './components/Router';
import { DefaultMeta } from './components/Meta';
import { HelmetProvider } from 'react-helmet-async';
import { Redirects } from './components/Redirects';
import { Stepper } from './components/Stepper';
import { Layout } from './components/Layout';
import { AddTokenToWallet } from './components/AddTokenToWallet';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { AppVersionCheck } from './components/AppVersionCheck';
import { Tenderly } from './components/Tenderly/Tenderly';

const Home = lazy(() => import(`./features/home`));
const Vault = lazy(() => import(`./features/vault`));
const OnRamp = lazy(() => import(`./features/on-ramp`));
const Bridge = lazy(() => import(`./features/bridge`));
const Dashboard = lazy(() => import(`./features/dashboard`));
const Treasury = lazy(() => import(`./features/treasury`));
const PageNotFound = lazy(() => import(`./features/pagenotfound`));

type BoundariesProps = { children?: ReactNode };
const Boundaries = memo<BoundariesProps>(function Boundaries({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullscreenTechLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
});

export const App = () => {
  useEffect(() => {
    initAppData(store);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <DefaultMeta />
          <Redirects />
          <Layout header={<Header />} footer={<Footer />}>
            <Switch>
              <Route exact path="/">
                <Boundaries>
                  <Home />
                </Boundaries>
              </Route>
              <Route strict sensitive exact path={['/:network/vault/:id', '/vault/:id']}>
                <Boundaries>
                  <Vault />
                </Boundaries>
              </Route>
              <Route exact path="/onramp">
                <Boundaries>
                  <OnRamp />
                </Boundaries>
              </Route>
              <Route exact path="/bridge">
                <Boundaries>
                  <Bridge />
                </Boundaries>
              </Route>
              <Route strict exact path="/dashboard/:address">
                <Boundaries>
                  <Dashboard mode={'url'} />
                </Boundaries>
              </Route>
              <Route exact path="/dashboard">
                <Boundaries>
                  <Dashboard mode={'wallet'} />
                </Boundaries>
              </Route>
              <Route exact path="/treasury">
                <Boundaries>
                  <Treasury />
                </Boundaries>
              </Route>
              <Route>
                <Boundaries>
                  <PageNotFound />
                </Boundaries>
              </Route>
            </Switch>
            <Stepper />
            <AddTokenToWallet />
          </Layout>
        </Router>
      </HelmetProvider>
      <AppVersionCheck />
      {import.meta.env.DEV ? <Tenderly /> : null}
    </ThemeProvider>
  );
};
