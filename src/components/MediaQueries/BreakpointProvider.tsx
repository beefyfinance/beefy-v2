import { memo, type ReactNode, useLayoutEffect, useState } from 'react';
import { getMatchMedia } from './useMediaQuery.ts';
import { entries } from '../../helpers/object.ts';
import type { BreakpointMatches } from './types.ts';
import { BreakpointContext, defaultBreakpointMatches, getQueries } from './useBreakpoints.ts';

export const BreakpointProvider = memo<{ children: ReactNode }>(function BreakpointProvider({
  children,
}) {
  const [matches, setMatches] = useState<BreakpointMatches>(() =>
    entries(getQueries()).reduce((acc, [breakpoint, query]) => {
      acc[breakpoint] = getMatchMedia(query).matches;
      return acc;
    }, defaultBreakpointMatches)
  );

  useLayoutEffect(() => {
    const queries = getQueries();

    const listeners = entries(queries).map(([breakpoint, query]) => {
      const matchMedia = getMatchMedia(query);
      const listener = (e: MediaQueryListEvent) =>
        setMatches(prev => ({ ...prev, [breakpoint]: e.matches }));
      matchMedia.addEventListener('change', listener);
      return { matchMedia, listener };
    });

    return () => {
      listeners.forEach(({ matchMedia, listener }) =>
        matchMedia.removeEventListener('change', listener)
      );
    };
  }, [setMatches]);

  return <BreakpointContext.Provider value={matches}>{children}</BreakpointContext.Provider>;
});
