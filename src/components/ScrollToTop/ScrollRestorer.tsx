import { memo, useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { useAppDispatch } from '../../store.ts';
import { setDashboardLast, setVaultsLast } from '../../features/data/reducers/vaults-list.ts';

export const ScrollRestorer = memo(function ScrollRestorer() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const dispatch = useAppDispatch();
  const state = useRef({
    lastPath: location.pathname,
    lastScroll: new Map<string, number>(),
  });

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = state.current.lastPath;

    // Handle navigation types
    switch (navigationType) {
      case 'PUSH':
      case 'REPLACE':
        console.debug(`Saving scroll state of ${prevPath}`, window.scrollY);
        state.current.lastScroll.set(prevPath, window.scrollY);
        console.debug('Scrolling to top of new page');
        window.scrollTo(0, 0);

        // Handle vault-specific logic
        if (currentPath.startsWith('/vault/')) {
          const vaultId = currentPath.split('/')[2];
          if (prevPath === '/') {
            dispatch(setVaultsLast(vaultId));
          } else if (prevPath.startsWith('/dashboard/')) {
            dispatch(setDashboardLast(vaultId));
          }
        }
        break;

      case 'POP':
        if (currentPath !== '/' && !currentPath.startsWith('/dashboard/')) {
          const savedScroll = state.current.lastScroll.get(currentPath) ?? 0;
          console.debug(`Restoring scroll state of ${currentPath}`, savedScroll);
          window.scrollTo(0, savedScroll);
        }
        break;
    }

    console.debug('Updating lastPath to', currentPath);
    state.current.lastPath = currentPath;
  }, [location, navigationType, dispatch]);

  return null;
});
