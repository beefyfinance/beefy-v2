import { parsePath } from 'react-router';
import { routerMode } from './router-mode.ts';

export type LiveLocation = {
  pathname: string;
  search: string;
};

function getBrowserLiveLocation(): LiveLocation {
  return { pathname: window.location.pathname, search: window.location.search };
}

// mirrors react-router's createHashLocation 1:1 so extraction can never disagree with router state
function getHashLiveLocation(): LiveLocation {
  const parsed = parsePath(window.location.hash.substring(1));
  const search = parsed.search ?? '';
  let pathname = parsed.pathname ?? '/';
  if (!pathname.startsWith('/') && !pathname.startsWith('.')) {
    pathname = '/' + pathname;
  }
  return { pathname, search };
}

/** what useLocation would return if it never lagged */
export const getLiveLocation: () => LiveLocation =
  routerMode === 'browser' ? getBrowserLiveLocation : getHashLiveLocation;
