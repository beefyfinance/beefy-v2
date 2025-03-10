import { memo, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../store.ts';
import { setDashboardLast, setVaultsLast } from '../../features/data/reducers/vaults-list.ts';

export const ScrollRestorer = memo(function ScrollRestorer() {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const state = useRef({
    lastPath: '/',
    lastScroll: new Map<string, number>(),
  });

  useEffect(
    () =>
      history.listen((location, action) => {
        if (action === 'PUSH' || action === 'REPLACE') {
          console.debug(`Saving scroll state of ${state.current.lastPath}`, window.scrollY);
          state.current.lastScroll.set(state.current.lastPath, window.scrollY);
          console.debug('Scrolling to top of new page');
          window.scrollTo(0, 0);

          if (location.pathname.startsWith('/vault/')) {
            const vaultId = location.pathname.split('/').slice(2, 3).join('');
            if (state.current.lastPath === '/') {
              dispatch(setVaultsLast(vaultId));
            } else if (state.current.lastPath.startsWith('/dashboard/')) {
              dispatch(setDashboardLast(vaultId));
            }
          }
        } else if (action === 'POP') {
          if (location.pathname !== '/' && !location.pathname.startsWith('/dashboard/')) {
            const savedScroll = state.current.lastScroll.get(location.pathname);
            console.debug(`Restoring scroll state of ${location.pathname}`, savedScroll);
            window.scrollTo(0, state.current.lastScroll.get(location.pathname) ?? 0);
          } else {
            window.scrollTo(0, 0);
          }
        }

        console.debug('Updating lastPath to', location.pathname);
        state.current.lastPath = location.pathname;
      }),
    [history, state, dispatch]
  );

  return null;
});
