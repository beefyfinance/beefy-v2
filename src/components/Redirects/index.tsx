import { memo, useEffect } from 'react';
import { REDIRECTS } from '../../config/redirects';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { routerMode } from '../Router';

export const Redirects = memo(function () {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    // HashRouter -> BrowserRouter redirects
    if (
      routerMode === 'browser' &&
      window.location.pathname === '/' &&
      window.location.hash &&
      window.location.hash.substring(0, 2) === '#/'
    ) {
      const pathname = window.location.hash.substring(1);
      window.location.hash = '';
      history.push(pathname);
      return;
    }

    // Standard redirects
    for (const { to, from } of REDIRECTS) {
      if (matchPath(location.pathname, from)) {
        history.push(to);
        return;
      }
    }
  }, [location, history]);

  return null;
});
