import './main.css';
import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { App } from './App.tsx';
import { persistor, store } from './store.ts';
import { i18n } from './i18n.ts';
import { MinimalFallback } from './components/ErrorBoundary/MinimalFallback.tsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx';
import { I18nextProvider } from 'react-i18next';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary fallback={MinimalFallback}>
    <Provider store={store} noopCheck="never" stabilityCheck="never">
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);
