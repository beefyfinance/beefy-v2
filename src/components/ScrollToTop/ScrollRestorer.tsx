import { memo, useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router';
import { setDashboardLast, setVaultsLast } from '../../features/data/reducers/vaults-list.ts';
import { useAppDispatch } from '../../features/data/store/hooks.ts';

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
      case NavigationType.Push:
      case NavigationType.Replace: {
        // filter/url sync replaces search params in place; not a page navigation
        if (navigationType === NavigationType.Replace && currentPath === prevPath) {
          break;
        }
        // in-place swaps (e.g. CLM autocompound toggle) must not jump to top
        if (navigationType === NavigationType.Replace && location.state?.preserveScroll) {
          break;
        }
        state.current.lastScroll.set(prevPath, window.scrollY);
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
      }
      case NavigationType.Pop: {
        if (currentPath !== '/' && !currentPath.startsWith('/dashboard/')) {
          const savedScroll = state.current.lastScroll.get(currentPath) ?? 0;
          window.scrollTo(0, savedScroll);
        }
        break;
      }
    }

    state.current.lastPath = currentPath;
  }, [location, navigationType, dispatch]);

  return null;
});
