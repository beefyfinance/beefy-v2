import { lazy, memo, type ReactNode, Suspense, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header } from './components/Header/Header.tsx';
import { Footer } from './components/Footer/Footer.tsx';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop.tsx';
import { initAppData } from './features/data/actions/scenarios.ts';
import { store } from './store.ts';
import { FullscreenTechLoader } from './components/TechLoader/TechLoader.tsx';
import { Router } from './components/Router/Router.tsx';
import { DefaultMeta } from './components/Meta/DefaultMeta.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { Redirects } from './components/Redirects/Redirects.tsx';
import { Stepper } from './components/Stepper/Stepper.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { AddTokenToWallet } from './components/AddTokenToWallet/AddTokenToWallet.tsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx';
import { AppVersionCheck } from './components/AppVersionCheck/AppVersionCheck.tsx';
import { Tenderly } from './components/Tenderly/Tenderly.tsx';
import { BreakpointProvider } from './components/MediaQueries/BreakpointProvider.tsx';

const HomePage = lazy(() => import('./features/home/HomePage.tsx'));
const VaultPage = lazy(() => import('./features/vault/VaultPage.tsx'));
const OnRampPage = lazy(() => import('./features/on-ramp/OnRampPage.tsx'));
const BridgePage = lazy(() => import('./features/bridge/BridgePage.tsx'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage.tsx'));
const TreasuryPage = lazy(() => import('./features/treasury/TreasuryPage.tsx'));
const NotFoundPage = lazy(() => import('./features/pagenotfound/NotFoundPage.tsx'));

type BoundariesProps = {
  children?: ReactNode;
};
const Boundaries = memo(function Boundaries({ children }: BoundariesProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullscreenTechLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
});

export const App = memo(function App() {
  useEffect(() => {
    void initAppData(store);
  }, []);

  return (
    <BreakpointProvider>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <DefaultMeta />
          <Redirects />
          <Layout header={<Header />} footer={<Footer />}>
            <Switch>
              <Route exact path="/">
                <Boundaries>
                  <HomePage />
                </Boundaries>
              </Route>
              <Route strict sensitive exact path={['/:network/vault/:id', '/vault/:id']}>
                <Boundaries>
                  <VaultPage />
                </Boundaries>
              </Route>
              <Route exact path="/onramp">
                <Boundaries>
                  <OnRampPage />
                </Boundaries>
              </Route>
              <Route exact path="/bridge">
                <Boundaries>
                  <BridgePage />
                </Boundaries>
              </Route>
              <Route strict exact path="/dashboard/:address">
                <Boundaries>
                  <DashboardPage mode={'url'} />
                </Boundaries>
              </Route>
              <Route exact path="/dashboard">
                <Boundaries>
                  <DashboardPage mode={'wallet'} />
                </Boundaries>
              </Route>
              <Route exact path="/treasury">
                <Boundaries>
                  <TreasuryPage />
                </Boundaries>
              </Route>
              <Route>
                <Boundaries>
                  <NotFoundPage />
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
    </BreakpointProvider>
  );
});
