import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { App } from './App';
import { persistor, store } from './store';
import { i18n } from './i18n';
import { MinimalFallback } from './components/ErrorBoundary/MinimalFallback';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { I18nextProvider } from 'react-i18next';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary fallback={MinimalFallback}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);
