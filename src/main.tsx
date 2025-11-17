import './main.css';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router/dom';
import { HelmetProvider } from 'react-helmet-async';
import { PersistGate as ReduxPersistProvider } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './i18n.ts';
import { MinimalFallback } from './components/ErrorBoundary/MinimalFallback.tsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx';
import { MiniAppProvider } from './components/MiniApp/MiniAppProvider.tsx';
import { BreakpointProvider } from './components/MediaQueries/BreakpointProvider.tsx';
import { persistor, store } from './features/data/store/store.ts';
import { router } from './routes.ts';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary fallback={MinimalFallback}>
    <I18nextProvider i18n={i18n}>
      <ReduxProvider store={store} identityFunctionCheck="never" stabilityCheck="never">
        <ReduxPersistProvider loading={null} persistor={persistor}>
          <MiniAppProvider>
            <BreakpointProvider>
              <HelmetProvider>
                <RouterProvider router={router} />
              </HelmetProvider>
            </BreakpointProvider>
          </MiniAppProvider>
        </ReduxPersistProvider>
      </ReduxProvider>
    </I18nextProvider>
  </ErrorBoundary>
);
