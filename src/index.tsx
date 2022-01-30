import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './App';
import { store as storeV1, storeV2 } from './store';
import { featureFlag_isDataLoaderV2Enabled } from './features/data/utils/feature-flags';

import './i18n';

const store = featureFlag_isDataLoaderV2Enabled() ? storeV2 : storeV1;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
