import { memo, useEffect } from 'react';
import { REDIRECTS } from '../../config/redirects.ts';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { routerMode } from '../Router/Router.tsx';

export const Redirects = memo(function Redirects() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // HashRouter -> BrowserRouter redirects
    if (
      routerMode === 'browser' &&
      window.location.pathname === '/' &&
      window.location.hash &&
      window.location.hash.startsWith('#/')
    ) {
      const pathname = window.location.hash.substring(1);
      window.location.hash = '';
      navigate(pathname);
      return;
    }

    // Standard redirects
    for (const { to, from } of REDIRECTS) {
      const patterns = Array.isArray(from) ? from : [from];

      for (const pattern of patterns) {
        const match = matchPath(pattern, location.pathname);
        if (match) {
          const replacements = Object.entries(match.params);
          const redirectTo = replacements.reduce(
            (url, [key, value]) => url.replace(`:${key}`, value || ''),
            to
          );
          navigate(redirectTo);
          return;
        }
      }
    }
  }, [location, navigate]);

  return null;
});
