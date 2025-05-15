import './main.css';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { App } from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx';
import { MinimalFallback } from './components/ErrorBoundary/MinimalFallback.tsx';
import { i18n } from './i18n.ts';
import { persistor, store } from './features/data/store/store.ts';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary fallback={MinimalFallback}>
    <Provider store={store} identityFunctionCheck="never" stabilityCheck="never">
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);
