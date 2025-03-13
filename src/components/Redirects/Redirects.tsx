// Redirects component
import { memo, useEffect } from 'react';
import { REDIRECTS } from '../../config/redirects.ts';
import { matchPath, useNavigate, useLocation } from 'react-router';
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
      window.location.hash.substring(0, 2) === '#/'
    ) {
      const pathname = window.location.hash.substring(1);
      window.location.hash = '';
      navigate(pathname, { replace: true });
      return;
    }

    // Standard redirects
    for (const { to, from } of REDIRECTS) {
      const patterns = Array.isArray(from) ? from : [from];

      for (const pattern of patterns) {
        const normalizedPattern =
          typeof pattern === 'string' ? { path: pattern, end: true } : pattern;

        const match = matchPath(normalizedPattern, location.pathname);
        if (match) {
          const replacements = Object.entries(match.params);
          const redirectTo = replacements.reduce(
            (url, [key, value]) => url.replace(`:${key}`, value || ''),
            to
          );
          navigate(redirectTo, { replace: true });
          return;
        }
      }
    }
  }, [location, navigate]);

  return null;
});
