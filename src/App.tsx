import { lazy, memo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Routes } from 'react-router';
import { AddTokenToWallet } from './components/AddTokenToWallet/AddTokenToWallet.tsx';
import { AppVersionCheck } from './components/AppVersionCheck/AppVersionCheck.tsx';
import { Footer } from './components/Footer/Footer.tsx';
import { Header } from './components/Header/Header.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { BreakpointProvider } from './components/MediaQueries/BreakpointProvider.tsx';
import { DefaultMeta } from './components/Meta/DefaultMeta.tsx';
import { Redirects } from './components/Redirects/Redirects.tsx';
import { Router } from './components/Router/Router.tsx';
import { ScrollRestorer } from './components/ScrollToTop/ScrollRestorer.tsx';
import { Stepper } from './components/Stepper/Stepper.tsx';
import { Tenderly } from './components/Tenderly/Tenderly.tsx';

const HomePage = lazy(() => import('./features/home/HomePage.tsx'));
const VaultPage = lazy(() => import('./features/vault/VaultPage.tsx'));
const OnRampPage = lazy(() => import('./features/on-ramp/OnRampPage.tsx'));
const BridgePage = lazy(() => import('./features/bridge/BridgePage.tsx'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage.tsx'));
const TreasuryPage = lazy(() => import('./features/treasury/TreasuryPage.tsx'));
const NotFoundPage = lazy(() => import('./features/pagenotfound/NotFoundPage.tsx'));
const BeGemsPage = lazy(() => import('./features/campaigns/begems/BeGemsPage.tsx'));

export const App = memo(function App() {
  return (
    <BreakpointProvider>
      <HelmetProvider>
        <Router>
          <ScrollRestorer />
          <DefaultMeta />
          <Redirects />
          <Routes>
            <Route element={<Layout header={<Header />} footer={<Footer />} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/:network/vault/:id" caseSensitive={true} element={<VaultPage />} />
              <Route path="/vault/:id" element={<VaultPage />} />
              <Route path="/onramp" element={<OnRampPage />} />
              <Route path="/bridge" element={<BridgePage />} />
              <Route path="/dashboard/:address" element={<DashboardPage mode={'url'} />} />
              <Route path="/dashboard" element={<DashboardPage mode={'wallet'} />} />
              <Route path="/treasury" element={<TreasuryPage />} />
              <Route path="/campaigns/begems" element={<BeGemsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Stepper />
          <AddTokenToWallet />
        </Router>
      </HelmetProvider>
      <AppVersionCheck />
      {import.meta.env.DEV ?
        <Tenderly />
      : null}
    </BreakpointProvider>
  );
});
