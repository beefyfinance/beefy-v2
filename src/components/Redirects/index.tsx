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
      const match = matchPath(location.pathname, from);
      if (match) {
        const replacements: [string, string][] = Object.entries(match.params);
        const redirectTo =
          replacements.length === 0
            ? to
            : replacements.reduce(
                (url, replacement) => url.replace(`:${replacement[0]}`, replacement[1]),
                to
              );
        history.push(redirectTo);
        return;
      }
    }
  }, [location, history]);

  return null;
});
