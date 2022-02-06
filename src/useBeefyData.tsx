import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { initHomeDataV4 } from './features/data/actions/scenarios';

export function useBeefyData() {
  const store = useStore();

  useEffect(() => {
    // give some time to the app to render a loader before doing this
    setTimeout(() => initHomeDataV4(store), 50);
  }, [store]);
}
